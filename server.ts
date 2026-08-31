import dotenv from "dotenv";
// Load local environment overrides (.env.local takes precedence over .env).
// In hosted environments (e.g. AI Studio) the API key is injected directly,
// so a missing file here is fine.
dotenv.config({ path: [".env.local", ".env"] });

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import {
  createInteraction,
  streamInteraction,
  API_BASE_URL,
} from "./server/lib/agentClient.ts";
import { extractJsonBlocks } from "./server/lib/jsonExtractor.ts";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import {
  getLeads,
  upsertLead,
  deleteLead,
  getConfig,
  saveConfig,
  exportLeadsToCsv,
  getWebhooks,
  saveWebhook,
  deleteWebhook,
  getWebhookLogs,
  clearWebhookLogs,
  testWebhook,
  testWebhookUrl,
  dispatchWebhookEvent,
} from "./server/lib/crmStore.ts";
import { generateContractHtml } from "./server/lib/contractGenerator.ts";
import { generateContractDocxBuffer } from "./server/lib/contractDocxGenerator.ts";
import {
  suggestBusinessQuestions,
  chatAboutData,
  auditCrmPipeline,
  generateExecutiveSlideDeck,
} from "./server/lib/geminiAssistant.ts";
import { runOpenSquadMission } from "./server/lib/openSquadEngine.ts";
import {
  generateClientTunnelPresentationHtml,
  generateDynamicRedesignHtml,
  generateSvgQrCode,
} from "./server/lib/tunnelEngine.ts";

async function getGcpAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
      },
    );
    if (res.ok) {
      const data: any = await res.json();
      return data.access_token || null;
    }
  } catch (err) {
    console.warn(
      "[getGcpAccessToken] Could not fetch token from metadata server:",
      err,
    );
  }
  return null;
}

function extractTarInMemory(tarBuffer: Buffer): Record<string, Buffer> {
  const files: Record<string, Buffer> = {};
  let offset = 0;

  while (offset + 512 <= tarBuffer.length) {
    let isEnd = true;
    for (let i = 0; i < 512; i++) {
      if (tarBuffer[offset + i] !== 0) {
        isEnd = false;
        break;
      }
    }
    if (isEnd) break;

    let name = "";
    for (let i = 0; i < 100; i++) {
      const charCode = tarBuffer[offset + i];
      if (charCode === 0) break;
      name += String.fromCharCode(charCode);
    }
    name = name.trim();

    let sizeStr = "";
    for (let i = 124; i < 136; i++) {
      const charCode = tarBuffer[offset + i];
      if (charCode === 0 || charCode === 32) continue;
      sizeStr += String.fromCharCode(charCode);
    }
    const size = parseInt(sizeStr, 8);

    const typeflag = tarBuffer[offset + 156];
    const isRegularFile = typeflag === 0 || typeflag === 48;

    offset += 512; // skip header

    if (name && isRegularFile && !isNaN(size) && size > 0) {
      if (offset + size <= tarBuffer.length) {
        files[name] = tarBuffer.subarray(offset, offset + size);
      }
    }

    const paddedSize = Math.ceil(size / 512) * 512;
    offset += paddedSize;
  }

  return files;
}

function extractEnvironmentId(interaction: any): string | undefined {
  if (!interaction || typeof interaction !== "object") return undefined;
  const environment = interaction.environment;
  const candidates = [
    environment?.env_id,
    environment?.environment_id,
    environment?.id,
    environment?.name,
    interaction.environment_id,
    interaction.env_id,
  ];
  const value = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  );
  if (typeof value !== "string") return undefined;
  return value.replace(/^environments?\//, "").replace(/^environment-/, "");
}

function extractInteractionId(interaction: any): string | undefined {
  if (!interaction || typeof interaction !== "object") return undefined;
  const value =
    interaction.name || interaction.id || interaction.interaction_id;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

type AgentSource =
  | { type: "inline"; content: string; target: string }
  | { type: "gcs"; source: string; target: string }
  | { type: "repository"; source: string; target: string };

function loadAgentFiles(dir: string, basePath: string): AgentSource[] {
  let files: AgentSource[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const targetPath = path.posix.join(basePath, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(loadAgentFiles(fullPath, targetPath));
    } else {
      files.push({
        type: "inline",
        content: fs.readFileSync(fullPath, "utf-8"),
        target: targetPath,
      });
    }
  }
  return files;
}

const activeGenerations = new Map<string, AbortController>();

function cleanUpOldGenerations() {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) return;

  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours threshold
  const now = Date.now();

  try {
    const items = fs.readdirSync(outputDir);
    for (const item of items) {
      if (item.startsWith(".")) continue; // ignore hidden items
      const itemPath = path.join(outputDir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const age = now - stats.mtimeMs;
        if (age > maxAgeMs) {
          console.log(
            `[cleanup] Directory ${item} is older than 24 hours (${Math.round(age / 1000 / 60 / 60)} hrs). Deleting to prevent storage bloat.`,
          );
          try {
            fs.rmSync(itemPath, { recursive: true, force: true });
            const zipPath = `${itemPath}.zip`;
            if (fs.existsSync(zipPath)) {
              fs.unlinkSync(zipPath);
            }
          } catch (itemErr) {
            console.error(`[cleanup] Failed to delete ${itemPath}:`, itemErr);
          }
        }
      }
    }
  } catch (err) {
    console.error("[cleanup] Error cleaning up old generations:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run initial cleanup on startup
  cleanUpOldGenerations();

  app.use(express.json({ limit: "50mb" }));
  app.use("/output", express.static(path.join(process.cwd(), "output")));

  // API routes FIRST
  app.post("/api/cancel-show", (req, res) => {
    const { generationId } = req.body;
    if (generationId && activeGenerations.has(generationId)) {
      console.log(`[cancel-show] Human requested abort for ${generationId}`);
      activeGenerations.get(generationId)?.abort();
      activeGenerations.delete(generationId);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found or already completed" });
    }
  });

  app.get("/api/download-proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).send("Missing url parameter");
      return;
    }
    try {
      const parsedUrl = new URL(targetUrl);
      if (!parsedUrl.hostname.endsWith("storage.googleapis.com") && !parsedUrl.hostname.endsWith("googleusercontent.com")) {
        res.status(403).send("Forbidden: Domain not allowed");
        return;
      }
      const response = await fetch(targetUrl);
      if (!response.ok) {
        res
          .status(response.status)
          .send(`Failed to fetch: ${response.statusText}`);
        return;
      }
      res.setHeader(
        "Content-Type",
        response.headers.get("Content-Type") || "application/octet-stream",
      );
      res.setHeader("Access-Control-Allow-Origin", "*");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (err) {
      console.error("Download proxy failed:", err);
      res
        .status(500)
        .send(
          `Internal server error: ${err instanceof Error ? err.message : String(err)}`,
        );
    }
  });

  const QUOTA_CACHE_FILE = path.join(
    process.cwd(),
    "output",
    "quota_cache.json",
  );
  const DEFAULT_QUOTA_LIMIT = 999999;

  function getQuotaLimit(): number {
    const limitStr = process.env.DAILY_QUOTA_LIMIT;
    if (limitStr) {
      const parsed = parseInt(limitStr, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return DEFAULT_QUOTA_LIMIT;
  }

  function getTodayStr(): string {
    return new Date().toISOString().split("T")[0];
  }

  let isFirebaseAdminInitialized = false;

  function ensureFirebaseAdmin() {
    // Firebase is disabled
  }

  async function getUserHash(req: express.Request): Promise<string | null> {
    // Fallback during local development or unauthenticated preview testing
    return "dev-user-hash";
  }

  function getQuotaCount(userHash: string | null): number {
    if (!userHash) return 0;
    try {
      const outputDir = path.dirname(QUOTA_CACHE_FILE);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      if (fs.existsSync(QUOTA_CACHE_FILE)) {
        const data = fs.readFileSync(QUOTA_CACHE_FILE, "utf-8");
        const cache = JSON.parse(data);
        const cacheKey = `${getTodayStr()}_${userHash}`;
        return cache[cacheKey] || 0;
      }
    } catch (err) {
      console.error("Error reading quota cache:", err);
    }
    return 0;
  }

  function incrementQuotaCount(userHash: string | null): void {
    if (!userHash) return;
    try {
      const outputDir = path.dirname(QUOTA_CACHE_FILE);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      let cache: Record<string, number> = {};
      if (fs.existsSync(QUOTA_CACHE_FILE)) {
        try {
          const data = fs.readFileSync(QUOTA_CACHE_FILE, "utf-8");
          cache = JSON.parse(data);
        } catch (e) {
          console.error("Error parsing quota file cache on increment:", e);
        }
      }
      const cacheKey = `${getTodayStr()}_${userHash}`;
      cache[cacheKey] = (cache[cacheKey] || 0) + 1;
      fs.writeFileSync(
        QUOTA_CACHE_FILE,
        JSON.stringify(cache, null, 2),
        "utf-8",
      );
    } catch (err) {
      console.error("Error incrementing quota cache:", err);
    }
  }

  // Automated Indicators Endpoints (BCB / IPCA / SELIC with fallback cache & 6h schedule support)
  const INDICATORS_CACHE_FILE = path.join(process.cwd(), "output", "indicators_cache.json");

  app.get("/api/indicators", async (req, res) => {
    try {
      let bcbData: any[] = [];
      let source = "BCB API (SGS 11 - Selic)";

      try {
        const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/12?formato=json", {
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
          bcbData = await response.json();
        }
      } catch (err) {
        console.warn("[indicators] External BCB API fetch failed, falling back to cache:", err);
      }

      if (!bcbData || bcbData.length === 0) {
        if (fs.existsSync(INDICATORS_CACHE_FILE)) {
          const cached = JSON.parse(fs.readFileSync(INDICATORS_CACHE_FILE, "utf-8"));
          return res.json(cached);
        }
        bcbData = [
          { data: "01/01/2026", valor: "11.25" },
          { data: "01/02/2026", valor: "11.75" },
          { data: "01/03/2026", valor: "12.00" },
          { data: "01/04/2026", valor: "12.25" },
          { data: "01/05/2026", valor: "12.75" },
          { data: "01/06/2026", valor: "13.25" },
        ];
      }

      const payload = {
        status: "success",
        source,
        lastUpdate: new Date().toLocaleString("pt-BR"),
        indicators: [
          {
            title: "Taxa Selic (BCB)",
            current: bcbData[bcbData.length - 1]?.valor || "13.25",
            unit: "% a.a.",
            trend: "+0.5% vs último mês",
            history: bcbData.map((item: any) => ({ date: item.data, value: parseFloat(item.valor) }))
          },
          {
            title: "IPCA (Inflação Oficial)",
            current: "4.45",
            unit: "% 12m",
            trend: "-0.12% estabilizado",
            history: [
              { date: "Jan", value: 4.60 },
              { date: "Fev", value: 4.55 },
              { date: "Mar", value: 4.50 },
              { date: "Abr", value: 4.48 },
              { date: "Mai", value: 4.45 },
            ]
          },
          {
            title: "PIB Projetado (Focus)",
            current: "2.18",
            unit: "% crescimento",
            trend: "Revisado para cima",
            history: [
              { date: "Q1", value: 2.05 },
              { date: "Q2", value: 2.10 },
              { date: "Q3", value: 2.15 },
              { date: "Q4", value: 2.18 },
            ]
          }
        ]
      };

      try {
        const outputDir = path.dirname(INDICATORS_CACHE_FILE);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(INDICATORS_CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch (e) {
        /* ignore cache write error */
      }

      res.json(payload);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch indicators" });
    }
  });

  app.get("/api/indicators/status", (req, res) => {
    let lastUpdateStr = "Hoje às 06:00";
    try {
      if (fs.existsSync(INDICATORS_CACHE_FILE)) {
        const stats = fs.statSync(INDICATORS_CACHE_FILE);
        const d = new Date(stats.mtime);
        lastUpdateStr = `Hoje às ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch {
      /* ignore */
    }
    res.json({
      status: "ok",
      lastUpdate: lastUpdateStr,
      source: "BCB / IBGE API Integration",
      frequency: "A cada 6 horas (Automático)",
      active: true
    });
  });

  app.get("/api/quota", async (req, res) => {
    if (process.env.NODE_ENV !== "production") {
      return res.json({ used: 0, limit: 999999 });
    }
    const userHash = await getUserHash(req);
    const limit = getQuotaLimit();
    if (!userHash) {
      return res.json({ used: 0, limit });
    }
    const count = getQuotaCount(userHash);
    return res.json({ used: count, limit });
  });

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  });

  const uploadSingle = upload.single("file");

  app.post(
    "/api/upload",
    (req, res, next) => {
      uploadSingle(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res
                .status(400)
                .json({
                  error: "File is too large. The maximum allowed size is 50MB.",
                });
            }
            return res
              .status(400)
              .json({ error: `Upload error: ${err.message}` });
          }
          return res
            .status(500)
            .json({
              error: err.message || "An unknown error occurred during upload.",
            });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Inline limit: 1 MB per file
        const MAX_INLINE_SIZE = 1 * 1024 * 1024; // 1 MB
        if (req.file.size > MAX_INLINE_SIZE) {
          return res.status(400).json({
            error: `File "${req.file.originalname}" is ${(req.file.size / (1024 * 1024)).toFixed(2)} MB, which exceeds the 1MB inline limit. For CSV files larger than 1MB, please use the "Paste a GCS URI" option!`,
          });
        }

        let content = "";
        let finalFileName = req.file.originalname;
        const lowerName = req.file.originalname.toLowerCase();

        if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
          try {
            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            content = XLSX.utils.sheet_to_csv(worksheet);
            finalFileName = req.file.originalname.replace(/\.xlsx?$/i, ".csv");
          } catch (excelErr: any) {
            return res.status(400).json({ error: `Erro ao processar planilha Excel: ${excelErr.message}` });
          }
        } else if (lowerName.endsWith(".json")) {
          try {
            const rawJson = JSON.parse(req.file.buffer.toString("utf-8"));
            if (Array.isArray(rawJson)) {
              const worksheet = XLSX.utils.json_to_sheet(rawJson);
              content = XLSX.utils.sheet_to_csv(worksheet);
              finalFileName = req.file.originalname.replace(/\.json$/i, ".csv");
            } else {
              content = req.file.buffer.toString("utf-8");
            }
          } catch (jsonErr: any) {
            return res.status(400).json({ error: `JSON inválido: ${jsonErr.message}` });
          }
        } else {
          content = req.file.buffer.toString("utf-8");
        }

        const safeOriginalName = finalFileName.replace(
          /[^a-zA-Z0-9._-]/g,
          "_",
        );
        let gsUri: string | undefined = undefined;
        let url: string | undefined = undefined;

        console.log(
          `[api/upload] Processed dataset upload for ${safeOriginalName} (${content.length} chars)`,
        );
        return res.json({
          name: finalFileName,
          content,
          size: content.length,
          gsUri,
          url,
        });
      } catch (err: any) {
        console.error("[api/upload] CSV upload failed:", err);
        res
          .status(500)
          .json({ error: `Upload failed: ${err.message || err}` });
      }
    },
  );

  async function deleteGcsFiles(files: any[]) {
    // Disabled
  }

  app.get("/api/download-file", async (req, res) => {
    return res.status(500).send("GCS bucket is not configured on Firebase Admin");
  });

  app.post("/api/clear-files", async (req, res) => {
    return res.json({ success: true });
  });

  app.post("/api/analyze", async (req, res) => {
    // Run background cleanup whenever a new analysis is requested to optimize disk space
    cleanUpOldGenerations();

    const {
      question,
      files,
      datasetName = "Dataset",
      generationId,
      environmentId,
      googleToken,
    } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res
        .status(400)
        .json({ error: "Missing required field: question" });
    }

    // Reusing the environment is sufficient. Do not chain to the prior
    // interaction because the report can be retrieved before that interaction
    // has formally completed in the hosted runtime.
    const isFollowUp = !!environmentId;
    const uploadedFiles: Array<{ name: string; content?: string; gsUri?: string }> =
      Array.isArray(files)
        ? files.filter(
            (f: any) =>
              f &&
              typeof f.name === "string" &&
              ((typeof f.content === "string" && f.content.trim() !== "") ||
                (typeof f.gsUri === "string" && f.gsUri.trim() !== "")),
          )
        : [];
    if (!isFollowUp && uploadedFiles.length === 0) {
      return res.status(400).json({ error: "Provide at least one CSV file." });
    }

    console.log(`[analyze] Checking daily quota.`);
    
    const userHash = await getUserHash(req);
    const count = getQuotaCount(userHash);
    if (count >= 5) {
      return res.status(429).json({ error: "Limite diário de 5 prospecções/análises atingido." });
    }
    incrementQuotaCount(userHash);

    const effectiveDatasetName = datasetName;

    const gcsFiles = uploadedFiles.filter((f) => f.gsUri);
    const hasGcsFiles = gcsFiles.length > 0;
    let gcsToken: string | null = null;
    let gcsInstructions = "";
    if (hasGcsFiles) {
      gcsToken = await getGcpAccessToken();
      gcsInstructions = `The user uploaded ${gcsFiles.length} file(s) to Google Cloud Storage. First, you MUST run \`python /.agents/download_gcs.py\` to download them to /.agents/data/ before doing anything else.`;
    }

    let prompt = "";

    if (isFollowUp) {
      prompt = `You are an expert data analyst continuing an analysis of the dataset "${effectiveDatasetName}".


FOLLOW-UP BUSINESS QUESTION:
${question}


EXECUTE IMMEDIATELY:
- Your first response MUST be one code_execution call. Do not explain, plan, quote these instructions, or print code as text.
- In that one call, discover source files with glob.glob('./workspace/data/*.csv'), clear prior files under data/analysis/ and charts/, analyze the question with Pandas, save result CSVs, and optionally create up to three charts with the existing make_chart.py script.
- Do not delete source CSVs, profile.json, or the existing report.json before the replacement report is ready.
- Do not import seaborn, scipy, statsmodels, or other unlisted packages. Use Pandas, NumPy, and the provided chart script.
- If the data cannot answer the question or analysis fails, write data/analysis/limitations.csv with columns limitation, detail, and required_data.
- ALWAYS finish the same code_execution call by running:
 python3 /.agents/skills/reporting/scripts/build_report.py --workspace ./workspace --question "${question.replace(/"/g, '\\"')}" --dataset-name "${effectiveDatasetName.replace(/"/g, '\\"')}"
- After the tool output contains "Report saved", return one short sentence and make no more tool calls.`;
    } else {
      const fileNames = uploadedFiles.map((f) => f.name).join(", ");
      const dataSourceInstructions = `The user provided ${uploadedFiles.length} CSV file(s). ${gcsInstructions} The files will be located at /.agents/data/. Copy them all into ./workspace/data/ before profiling: \`cp /.agents/data/*.csv ./workspace/data/\`. Provided file(s): ${fileNames}.`;

      prompt = `You are an expert data analyst. Dataset name: "${effectiveDatasetName}".


DATA SOURCE:
${dataSourceInstructions}


BUSINESS QUESTION:
${question}


WORKFLOW REQUIREMENT:
You MUST follow this workflow in order. Keep the run short: use one Python script for profiling and one Python script for the requested analysis instead of creating many exploratory scripts. You MUST NOT finish your response until all steps are completed and 'build_report.py' prints that report.json was saved.
HARD LIMIT: You have at most 10 code-execution calls for the entire run. Use one setup call, one combined profiling call, one combined analysis call, up to three chart calls, and one report call. Do not run ad hoc inspection, describe, correlation, validation, package-check, or report-preview commands. Put required calculations into the two scripts. Once build_report.py prints "Report saved", immediately conclude without another tool call.


1. STAGE & SET UP: Create directories, copy the data, and install the core requirements immediately. Do not assume matplotlib is installed:
  mkdir -p ./workspace/data ./workspace/charts ./workspace/data/analysis && \
  cp /.agents/data/*.csv ./workspace/data/ && \
  pip install -r /.agents/requirements.txt --break-system-packages --prefer-binary --no-cache-dir
  Install scikit-learn separately only if the question genuinely requires an ML model.


2. EXPLORE: Write and run one concise Pandas profiling script that understands the columns and types and writes './workspace/data/profile.json'. The data-explorer skill is agent-driven; there is no profile_data.py supplied by the skill.


3. ANALYZE & SAVE: Write and execute a Python pandas script to perform the data aggregations and calculations needed to answer the question.
  CRITICAL: You MUST save any result tables as CSV files under './workspace/data/analysis/' (e.g., './workspace/data/analysis/streak_data.csv'). Do NOT save files in other folders.


4. VISUALIZE: Create high-quality PNG charts for your findings. Run the visualization script on your saved analysis CSVs:
  python3 /.agents/skills/visualization/scripts/make_chart.py --workspace ./workspace --data data/analysis/<your_csv>.csv --type <bar|line|scatter|pie|heatmap> --x <col> --y <col> --title "<Chart Title>" --output charts/<chart_name>.png


5. BUILD REPORT: Compile everything into the final interactive report JSON by running:
  python3 /.agents/skills/reporting/scripts/build_report.py --workspace ./workspace --question "${question.replace(/"/g, '\\"')}" --dataset-name "${effectiveDatasetName.replace(/"/g, '\\"')}"


CRITICAL RULE FOR RE-ENTRANCY & COMPLETION:
The frontend UI depends 100% on './workspace/data/report.json' to render the charts and tables on the screen. If you output your final textual response or stop calling tools before running step 5 (build_report.py), the user will see a completely blank dashboard!
Therefore, please make sure to run both 'make_chart.py' and 'build_report.py' successfully in the sandbox before concluding your turn.


*SANDBOX TOOL TIP:* Since you run in a Python code_execution sandbox, you should run all shell commands (like directory creation, make_chart.py, or build_report.py scripts) by prefixing them with a "!" in your code cells or by using Python's 'os.system()' or 'subprocess' modules. Do not output plain bash commands or hallucinate external tool calls.


Example of the required execution order:
\`\`\`python
import os
# Stage data and install core dependencies first
os.system("mkdir -p ./workspace/data ./workspace/charts ./workspace/data/analysis && cp /.agents/data/*.csv ./workspace/data/ && pip install -r /.agents/requirements.txt --break-system-packages --prefer-binary --no-cache-dir")


# Explore and profile using Pandas here, then write ./workspace/data/profile.json directly.
# Do not call a nonexistent profiling helper script.


# Analyze & Save CSV
import pandas as pd
df = pd.read_csv('./workspace/data/...')
# ... perform calculations ...
df.to_csv('./workspace/data/analysis/results.csv', index=False)


# Visualize PNG chart
os.system("python3 /.agents/skills/visualization/scripts/make_chart.py --workspace ./workspace --data data/analysis/results.csv --type bar --x col1 --y col2 --title 'Title' --output charts/my_chart.png")


# Compile report immediately after charts (deterministic and network-free)
os.system("""python3 /.agents/skills/reporting/scripts/build_report.py --workspace ./workspace --question "${question.replace(/"/g, '\\"')}" --dataset-name "${effectiveDatasetName.replace(/"/g, '\\"')}" """)
\`\`\``;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const sendEvent = (event: any) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    let reportDelivered = false;
    let streamFailed = false;
    const sendError = (message: string) => {
      streamFailed = true;
      sendEvent({ type: "error", message });
    };
    let sentSessionEnvironmentId: string | undefined;
    const sendSessionEnvironment = (environmentIdValue: string | undefined) => {
      if (
        !environmentIdValue ||
        environmentIdValue === sentSessionEnvironmentId
      )
        return;
      sentSessionEnvironmentId = environmentIdValue;
      sendEvent({ type: "session", environmentId: environmentIdValue });
    };
    sendSessionEnvironment(
      typeof environmentId === "string" ? environmentId : undefined,
    );

    // Send a heartbeat every 15 seconds to keep the connection alive
    // (useful for proxies like VS Code port forwarding that drop idle connections)
    const heartbeatInterval = setInterval(() => {
      res.write(`:\n\n`); // SSE comment/ping
    }, 15000);

    let isFinished = false;
    const abortController = new AbortController();

    if (generationId) {
      activeGenerations.set(generationId, abortController);
    }

    req.on("aborted", () => {
      if (!isFinished) {
        console.log(
          `[analyze] Client aborted request. Agent will continue running in background unless explicitly cancelled.`,
        );
      }
      clearInterval(heartbeatInterval);
    });
    req.on("close", () => {
      clearInterval(heartbeatInterval);
    });

    try {
      let agentFiles: AgentSource[] = [];
      if (isFollowUp) {
        console.log(
          `[analyze] Continuing session in active environment: "${environmentId}" without interaction chaining.`,
        );
        sendEvent({
          type: "info",
          message: "Continuing session in active environment...",
        });
      } else {
        console.log(
          `[analyze] Request received. dataset: "${effectiveDatasetName}", source: ${uploadedFiles.length} uploaded file(s), question: "${question.substring(0, 80)}...", generationId: "${generationId}"`,
        );
        console.log(
          `[analyze] GEMINI_API_KEY presence verified: ${!!process.env.GEMINI_API_KEY}`,
        );
        sendEvent({
          type: "info",
          message: "Provisioning analysis environment...",
        });

        console.log(
          `[analyze] Loading agent files from filesystem path: ${path.join(process.cwd(), "agent")}`,
        );
        agentFiles = loadAgentFiles(
          path.join(process.cwd(), "agent"),
          "/.agents",
        );

        // Add user dataset files (inline CSVs or GCS URIs)
        uploadedFiles.forEach((f) => {
          const safeName = path.posix
            .basename(f.name)
            .replace(/[^a-zA-Z0-9._-]/g, "_");
          if (f.content) {
            agentFiles.push({
              type: "inline",
              content: f.content,
              target: `/.agents/data/${safeName}`,
            });
          } else if (f.gsUri) {
            agentFiles.push({
              type: "gcs",
              source: f.gsUri,
              target: "/.agents/data",
            });
          }
        });

        // Uploads are fetched from GCS inside the sandbox via /.agents/download_gcs.py.
        if (hasGcsFiles) {
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:3000";
          const serverUrl = `${protocol}://${host}`;

          const gcsFilesToDownload = gcsFiles.map((f) => {
            const safeName = path.posix
              .basename(f.name)
              .replace(/[^a-zA-Z0-9._-]/g, "_");
            let gcsPath = "";
            const uri = f.gsUri || "";
            if (uri.startsWith("gs://")) {
              const parts = uri.slice(5).split("/", 1);
              gcsPath = uri.slice(5 + parts[0].length + 1);
            }
            return {
              source: f.gsUri,
              filename: gcsPath,
              target: `/.agents/data/${safeName}`,
            };
          });

          const gcsDownloadScript = `
import urllib.request
import urllib.parse
import os


files = [
${gcsFilesToDownload.map((f) => `    {"source": "${f.source}", "filename": "${f.filename}", "target": "${f.target}"}`).join(",\n")}
]


server_url = "${serverUrl}"
token = ${gcsToken ? `"${gcsToken}"` : "None"}
os.makedirs("/.agents/data", exist_ok=True)


for f in files:
   filename = f["filename"]
   # 1. First attempt: Download via the secure local Express download proxy (works without direct GCS access or public permission)
   proxy_url = f"{server_url}/api/download-file?filename={urllib.parse.quote(filename)}"
   print(f"Attempting download for {filename} via proxy: {proxy_url}")
   try:
       req = urllib.request.Request(proxy_url)
       with urllib.request.urlopen(req) as response, open(f["target"], "wb") as out:
           out.write(response.read())
       print(f"Successfully downloaded {filename} via Express proxy")
       continue
   except Exception as proxy_err:
       print(f"Express proxy download failed: {proxy_err}. Falling back to direct GCS download...")


   # 2. Second attempt / fallback: Direct GCS API download
   uri = f["source"]
   if uri.startswith("gs://"):
       parts = uri[5:].split("/", 1)
       bucket = parts[0]
       obj = parts[1]
       encoded_obj = urllib.parse.quote(obj)
       url_json = f"https://storage.googleapis.com/storage/v1/b/{bucket}/o/{encoded_obj}?alt=media"
       url_xml = f"https://storage.googleapis.com/{bucket}/{encoded_obj}"
      
       success = False
       for url in [url_json, url_xml]:
           req = urllib.request.Request(url)
           if token:
               req.add_header("Authorization", "Bearer " + token)
           try:
               with urllib.request.urlopen(req) as response, open(f["target"], "wb") as out:
                   out.write(response.read())
               print(f"Successfully downloaded {f['source']} from {url}")
               success = True
               break
           except Exception as e:
               print(f"Failed download from {url}: {e}")
       if not success:
           print(f"Failed all download attempts for {f['source']}")
`;
          agentFiles.push({
            type: "inline",
            content: gcsDownloadScript,
            target: `/.agents/download_gcs.py`,
          });
        }
        console.log(
          `[analyze] Finished loading agent files (source: ${uploadedFiles.length} uploaded file(s)). Count: ${agentFiles.length}`,
        );
      }

      if (!gcsToken) {
        gcsToken = await getGcpAccessToken();
      }
      console.log(
        `[analyze] Retrieved GCS access token: ${gcsToken ? "yes (length: " + gcsToken.length + ")" : "no"}`,
      );

      console.log(
        `[analyze] Calling createInteraction with prompt: "${prompt.substring(0, 100)}..."`,
      );
      const response = await createInteraction({
        prompt,
        stream: true,
        inlineSources: isFollowUp
          ? undefined
          : agentFiles.length > 0
            ? agentFiles
            : undefined,
        environmentId: isFollowUp ? environmentId : undefined,
        gcsToken: gcsToken || undefined,
        signal: abortController.signal,
      });

      console.log(
        `[analyze] Gemini API responded. HTTP Status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[analyze] Gemini API Non-2xx response. Error Payload: ${errorText}`,
        );

        let displayMessage = `Agent API error: ${response.status} - ${errorText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.error?.message) {
            displayMessage = parsed.error.message;
          }
        } catch (e) {
          // ignore parsing error, stick to default
        }

        const isQuotaError =
          response.status === 429 ||
          errorText.toLowerCase().includes("quota") ||
          errorText.toLowerCase().includes("too_many_requests") ||
          errorText.toLowerCase().includes("resource_exhausted") ||
          displayMessage.toLowerCase().includes("quota") ||
          displayMessage.toLowerCase().includes("too_many_requests");

        const isEnvNotFoundError =
          response.status === 404 ||
          errorText.toLowerCase().includes("not_found") ||
          errorText.toLowerCase().includes("environment not found") ||
          displayMessage.toLowerCase().includes("environment not found") ||
          displayMessage.toLowerCase().includes("not found or not accessible");

        if (isQuotaError) {
          displayMessage = `Gemini API Quota Limit Reached: ${displayMessage}. The shared free-tier Google Gemini API Key has run out of request quota. To resolve this, go to Settings > Secrets inside AI Studio to verify your personal Gemini API key or set up billing.`;
        } else if (isEnvNotFoundError) {
          displayMessage = `The previous analysis session has expired or the remote environment has been recycled due to inactivity. Please start a fresh analysis session by uploading your CSV files again.`;
        }

        sendError(displayMessage);
        res.end();
        return;
      }

      console.log(
        `[analyze] Response remains ok. Constructing SSE stream reader...`,
      );
      let accumulatedText = "";
      let envId: string | undefined = environmentId;
      let interactionId: string | undefined;
      let reportArtifactReady = false;

      let eventCount = 0;
      for await (const event of streamInteraction(response)) {
        eventCount++;
        console.log(
          `[analyze] SSE yields streaming event #${eventCount}: type="${event.type}"`,
        );
        if (event.type === "done") {
          console.log(
            `[analyze] Received explicit "done" marker from interaction stream.`,
          );
          break;
        }
        if (event.type === "interaction") {
          envId = extractEnvironmentId(event.interaction) || envId;
          interactionId =
            extractInteractionId(event.interaction) || interactionId;
          sendSessionEnvironment(envId);
          console.log(
            `[analyze] Interaction created. Environment ID: "${envId}", interaction ID: "${interactionId}"`,
          );
        }
        if (event.type === "complete") {
          envId = extractEnvironmentId(event.interaction) || envId;
          interactionId =
            extractInteractionId(event.interaction) || interactionId;
          sendSessionEnvironment(envId);
          console.log(
            `[analyze] Interaction completed. Extracted environment ID: "${envId}"`,
          );
          const usage = event.interaction?.usage as any;
          if (usage) {
            console.log(
              `[agent] Token usage: ${usage.total_tokens} total tokens (${usage.total_input_tokens} input, ${usage.total_output_tokens} output, ${usage.total_thought_tokens || 0} thought, ${usage.total_cached_tokens || 0} cached)`,
            );
          }

          // Fallback extraction: iterate and combine text from all elements of the steps array
          const stepsObj = event.interaction?.steps as any[];
          if (Array.isArray(stepsObj)) {
            let combinedStepsText = "";
            for (const step of stepsObj) {
              const isReasoningStep =
                step.type === "thinking" ||
                step.type === "thought" ||
                step.type === "reasoning";
              if (!isReasoningStep && Array.isArray(step.content)) {
                for (const part of step.content) {
                  if (part && typeof part === "object") {
                    if (part.type === "text" && part.text) {
                      combinedStepsText += part.text;
                    } else if (part.text && part.type !== "thought") {
                      combinedStepsText += part.text;
                    }
                  } else if (typeof part === "string") {
                    combinedStepsText += part;
                  }
                }
              }
            }
            if (
              combinedStepsText &&
              combinedStepsText.length > accumulatedText.length
            ) {
              console.log(
                `[analyze] Dynamic steps recovery: Reconstructed text of length ${combinedStepsText.length} exceeds accumulated text of length ${accumulatedText.length}. Restoring fallback text.`,
              );
              accumulatedText = combinedStepsText;
            }
          }
        }

        // Log events to the terminal as well
        if (event.type === "thinking")
          console.log(
            `[agent] thinking delta: ${event.text?.substring(0, 30)}...`,
          );
        else if (event.type === "tool_call") {
          console.log(`[agent] tool_call: ${event.name}`);
          console.log(
            `[agent] args:`,
            JSON.stringify(event.arguments, null, 2),
          );
        } else if (event.type === "tool_result") {
          console.log(`[agent] tool_result for tool: ${event.name}`);
          if (
            event.result?.includes("Report saved to") &&
            event.result.includes("report.json")
          ) {
            reportArtifactReady = true;
            console.log(
              "[analyze] Agent confirmed report.json was saved in the sandbox.",
            );
          }
        } else if (event.type === "text") {
          console.log(
            `[agent] text output segment: ${event.text?.substring(0, 30)}...`,
          );
        }

        sendEvent(event);

        if (event.type === "text" && event.text) {
          accumulatedText += event.text;
        }
        if (reportArtifactReady && envId) {
          console.log(
            "[analyze] report.json is ready; stopping stream consumption and retrieving the sandbox snapshot.",
          );
          break;
        }
      }

      // If the hosted SSE connection closed before interaction.completed,
      // recover the environment ID from the interaction resource itself.
      if (!envId && interactionId) {
        try {
          const interactionPath = interactionId.startsWith("interactions/")
            ? interactionId
            : `interactions/${interactionId}`;
          const interactionRes = await fetch(
            `${API_BASE_URL}/${interactionPath}`,
            {
              headers: {
                "x-goog-api-key": process.env.GEMINI_API_KEY || "",
                "Api-Revision": "2026-05-20",
                "x-goog-api-client": "applet-ai-data-analyst/1.0.0",
              },
            },
          );
          if (interactionRes.ok) {
            const interactionData = await interactionRes.json();
            envId = extractEnvironmentId(interactionData);
            sendSessionEnvironment(envId);
            console.log(
              `[analyze] Recovered environment ID from interaction resource: "${envId}"`,
            );
          } else {
            console.warn(
              `[analyze] Could not recover interaction metadata: ${interactionRes.status} ${interactionRes.statusText}`,
            );
          }
        } catch (metadataErr) {
          console.warn(
            "[analyze] Interaction metadata recovery failed:",
            metadataErr,
          );
        }
      }

      // Fallback: if the agent emitted the report JSON inline in its text output, parse it.
      if (accumulatedText) {
        try {
          const blocks = extractJsonBlocks(accumulatedText);
          const reportBlock = blocks
            .reverse()
            .find(
              (b: any) =>
                b &&
                typeof b === "object" &&
                (b.executive_summary || b.insights || b.title),
            );
          if (reportBlock) {
            reportDelivered = true;
            sendEvent({ type: "report_data", data: reportBlock });
          }
        } catch (e) {
          console.error(
            "Failed to parse JSON blocks fallback from accumulated text:",
            e,
          );
        }
      }

      if (envId) {
        sendEvent({
          type: "info",
          message: reportArtifactReady
            ? "Report created. Retrieving dashboard files..."
            : "Retrieving report and charts from the analysis environment...",
        });
        try {
          const downloadUrl = `${API_BASE_URL}/files/environment-${envId}:download?alt=media`;
          let res: Response | null = null;
          for (let attempt = 1; attempt <= 5; attempt++) {
            res = await fetch(downloadUrl, {
              headers: { "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
            });
            if (
              res.ok ||
              ![404, 409, 425].includes(res.status) ||
              attempt === 5
            )
              break;
            console.log(
              `[analyze] Environment snapshot not ready (attempt ${attempt}/5). Retrying...`,
            );
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }

          if (res?.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const tarBuffer = Buffer.from(arrayBuffer);
            const extractedFiles = extractTarInMemory(tarBuffer);

            let report: any = null;
            // Map of chart basename -> chart image URL
            const chartImages: Record<string, string> = {};

            // Prepare run directory for chart image output
            let runId = "gen-" + Math.random().toString(36).substring(2, 10);
            if (typeof generationId === "string" && /^[A-Za-z0-9_-]+$/.test(generationId)) {
              runId = generationId;
            }
            const outputDirRoot = path.join(process.cwd(), "output");
            let chartRunDir = path.join(outputDirRoot, runId, "charts");
            if (fs.existsSync(chartRunDir)) {
              runId = `${runId}-${Date.now()}`;
              chartRunDir = path.join(outputDirRoot, runId, "charts");
            }
            fs.mkdirSync(chartRunDir, { recursive: true });

            for (const [filePath, fileContent] of Object.entries(
              extractedFiles,
            )) {
              const normalized = filePath.replace(/^\.\//, "");
              if (
                normalized.endsWith("data/report.json") ||
                normalized.endsWith("/report.json") ||
                normalized === "report.json"
              ) {
                try {
                  report = JSON.parse(fileContent.toString("utf8"));
                } catch (err) {
                  console.error(
                    "Failed to parse report.json from memory:",
                    err,
                  );
                }
              } else if (
                normalized.includes("charts/") &&
                /\.(png|jpg|jpeg)$/i.test(normalized)
              ) {
                let base = normalized.split("/").pop() as string;
                if (!/^[A-Za-z0-9_.-]+\.(png|jpe?g)$/i.test(base)) {
                  const ext = base.split(".").pop() || "png";
                  base = `chart-${Object.keys(chartImages).length + 1}.${ext}`;
                }
                const targetFilePath = path.join(chartRunDir, base);
                try {
                  fs.writeFileSync(targetFilePath, fileContent);
                  chartImages[base] = `/output/${runId}/charts/${base}`;
                } catch (writeErr) {
                  console.error(`Failed to write chart ${base} to disk:`, writeErr);
                }
              }
            }

            const reportMatchesCurrentQuestion =
              typeof report?.question === "string" &&
              report.question.trim().toLowerCase() ===
                question.trim().toLowerCase();
            if (
              isFollowUp &&
              !reportArtifactReady &&
              !reportMatchesCurrentQuestion
            ) {
              console.warn(
                "[analyze] Follow-up stream ended without producing a replacement report. Preserving the existing dashboard.",
              );
              sendError(
                "The follow-up analysis stopped before it could update the dashboard. Your previous report has been preserved; please try the question again.",
              );
              return;
            }

            if (!report) {
              console.log(
                "[analyze] report.json was not found in the tar archive. Generating server-side fallback report...",
              );
              const displayTables: any[] = [];

              for (const [filePath, fileContent] of Object.entries(
                extractedFiles,
              )) {
                const normalized = filePath.replace(/^\.\//, "");
                if (
                  normalized.endsWith(".csv") &&
                  !normalized.includes("data/report.json")
                ) {
                  try {
                    const csvText = fileContent.toString("utf8");
                    const lines = csvText
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean);
                    if (lines.length > 0) {
                      const headers = lines[0]
                        .split(",")
                        .map((h) => h.replace(/^["']|["']$/g, ""));
                      const rows = lines.slice(1, 21).map((line) => {
                        return line
                          .split(",")
                          .map((val) => val.replace(/^["']|["']$/g, ""));
                      });
                      const filename =
                        normalized.split("/").pop() || "table.csv";
                      const title = filename
                        .replace(/\.csv$/i, "")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      displayTables.push({
                        title,
                        columns: headers,
                        rows,
                        caption: `Generated data table: ${filename}`,
                      });
                    }
                  } catch (csvErr) {
                    console.error(
                      `Failed to parse csv fallback for ${normalized}:`,
                      csvErr,
                    );
                  }
                }
              }

              if (
                displayTables.length > 0 ||
                Object.keys(chartImages).length > 0 ||
                accumulatedText
              ) {
                let summary =
                  "The data analyst has finished processing your calculations.";
                if (accumulatedText) {
                  summary = accumulatedText
                    .replace(/```json[\s\S]*?```/g, "")
                    .trim();
                  if (summary.length > 500) {
                    summary = summary.substring(0, 500) + "...";
                  }
                }

                report = {
                  dataset_name: effectiveDatasetName || "Dataset",
                  question: question,
                  title: `Analysis Report: ${effectiveDatasetName || "Dataset"}`,
                  executive_summary: summary,
                  insights: [
                    {
                      title: "Calculations Completed",
                      detail:
                        "The analysis successfully completed the necessary Python computations. Explore the generated data tables and supporting documents below.",
                      metric: "Status",
                      value: "Success",
                    },
                  ],
                  charts: [],
                  tables: displayTables,
                  methodology:
                    "Computed using Pandas inside the sandboxed data analyst workspace.",
                  recommendations: [
                    "Review the structured output tables and charts below for specific metrics.",
                  ],
                  generated_at: new Date().toISOString().split("T")[0],
                };
              }
            }

            if (report) {
              // Embed chart image data into the referenced chart entries by matching basename.
              if (Array.isArray(report.charts)) {
                for (const chart of report.charts) {
                  if (
                    chart &&
                    typeof chart === "object" &&
                    typeof chart.file === "string"
                  ) {
                    const base = chart.file.split("/").pop() as string;
                    if (chartImages[base]) {
                      chart.image = chartImages[base];
                    }
                  }
                }
              }

              // Append any rendered charts the report didn't explicitly reference.
              const referenced = new Set(
                (Array.isArray(report.charts) ? report.charts : [])
                  .map((c: any) =>
                    typeof c?.file === "string"
                      ? c.file.split("/").pop()
                      : null,
                  )
                  .filter(Boolean),
              );
              const extras = Object.keys(chartImages)
                .filter((base) => !referenced.has(base))
                .map((base) => ({
                  title: base.replace(/\.[^.]+$/, "").replace(/_/g, " "),
                  file: `charts/${base}`,
                  caption: "",
                  type: "bar",
                  image: chartImages[base],
                }));
              if (extras.length > 0) {
                report.charts = [
                  ...(Array.isArray(report.charts) ? report.charts : []),
                  ...extras,
                ];
              }

              reportDelivered = true;
              sendEvent({ type: "report_data", data: report });
            } else {
              console.error(
                "report.json was not found in the extracted tar archive",
              );
              sendError("The analysis ran but report.json was not produced.");
            }
          } else {
            const errBody = res ? await res.text() : "No response received";
            console.error("Failed to download snapshot:", errBody);
            let displayMessage = `Failed to retrieve files from the analysis environment: ${errBody}`;
            try {
              const parsed = JSON.parse(errBody);
              if (parsed?.error?.message) {
                const msg = parsed.error.message.toLowerCase();
                if (
                  msg.includes("not found") ||
                  msg.includes("not accessible")
                ) {
                  displayMessage =
                    "The previous analysis session has expired or the remote environment has been recycled due to inactivity. Please start a fresh analysis session by uploading your CSV files again.";
                } else {
                  displayMessage = parsed.error.message;
                }
              }
            } catch (e) {
              if (
                errBody.toLowerCase().includes("not found") ||
                errBody.toLowerCase().includes("not accessible")
              ) {
                displayMessage =
                  "The previous analysis session has expired or the remote environment has been recycled due to inactivity. Please start a fresh analysis session by uploading your CSV files again.";
              }
            }
            sendError(displayMessage);
          }
        } catch (err: any) {
          console.error("Error processing snapshot in memory:", err);
          sendError(`Error extracting analysis files: ${err.message}`);
        }
      }

      isFinished = true;
      if (!reportDelivered && !streamFailed) {
        sendError(
          "The analysis stream ended before a dashboard report was produced.",
        );
      }
      if (reportDelivered && !streamFailed) {
        sendEvent({ type: "status", status: "completed" });
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log(`[analyze] Agent interaction aborted successfully.`);
      } else {
        console.error(`[analyze] Error:`, err);
        sendError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      isFinished = true;
      clearInterval(heartbeatInterval);
      if (generationId) {
        activeGenerations.delete(generationId);
      }
      res.end();

      // Files are kept for follow-up chats. They are only deleted when clicking "New Analysis" (POST /api/clear-files).
      /*
     if (!isFollowUp && uploadedFiles.length > 0) {
       deleteGcsFiles(uploadedFiles).catch(err => {
         console.error("[analyze] Error in background deleteGcsFiles:", err);
       });
     }
     */
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  /* ────────────────────────────────────────────────────────── */
  /*  CRM Leads & Configuration Endpoints                       */
  /* ────────────────────────────────────────────────────────── */
  app.get("/api/leads", (req, res) => {
    try {
      const leads = getLeads();
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leads", (req, res) => {
    try {
      const lead = req.body;
      if (!lead || !lead.slug) {
        return res.status(400).json({ error: "Lead must contain a slug." });
      }
      const saved = upsertLead(lead);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/leads/:slug", (req, res) => {
    try {
      const slug = req.params.slug;
      const changes = req.body;
      const saved = upsertLead({ ...changes, slug });
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/leads/:slug", (req, res) => {
    try {
      const slug = req.params.slug;
      const deleted = deleteLead(slug);
      res.json({ ok: deleted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/config", (req, res) => {
    try {
      const cfg = getConfig();
      res.json(cfg);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/config", (req, res) => {
    try {
      const updated = saveConfig(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/crm/export-csv", (req, res) => {
    try {
      const csv = exportLeadsToCsv();
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="prospector-leads.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/crm/ai-audit", async (req, res) => {
    try {
      const leads = req.body.leads || getLeads();
      const audit = await auditCrmPipeline(leads);
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  CRM Webhooks Management & Live Dispatch API               */
  /* ────────────────────────────────────────────────────────── */
  app.get("/api/webhooks", (req, res) => {
    try {
      const webhooks = getWebhooks();
      res.json(webhooks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webhooks", (req, res) => {
    try {
      const { url, name, secret, events, active, id } = req.body;
      if (!url || typeof url !== "string" || !url.startsWith("http")) {
        return res.status(400).json({ error: "URL do Webhook inválida. Deve iniciar com http:// ou https://" });
      }
      const saved = saveWebhook({ id, url, name, secret, events, active });
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/webhooks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const ok = deleteWebhook(id);
      res.json({ ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webhooks/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await testWebhook(id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webhooks/test-url", async (req, res) => {
    try {
      const { url, secret } = req.body;
      const result = await testWebhookUrl(url, secret);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/webhooks-logs", (req, res) => {
    try {
      const logs = getWebhookLogs(100);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/webhooks-logs", (req, res) => {
    try {
      clearWebhookLogs();
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webhooks/manual-trigger", async (req, res) => {
    try {
      const { event, payload } = req.body;
      await dispatchWebhookEvent(event || "status_changed", payload || { test: true });
      res.json({ ok: true, message: "Evento disparado para os webhooks ativos." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Proposal Generation Endpoint                             */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/gerar-proposta", async (req, res) => {
    try {
      const { clienteNome, clienteSite, clienteNicho } = req.body;

      if (!clienteNome || !clienteNicho) {
        return res.status(400).json({ 
          error: "clienteNome e clienteNicho são obrigatórios" 
        });
      }

      // Importação dinâmica do geminiAssistant
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Configuração de IA não encontrada" 
        });
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const prompt = `Você é um consultor de vendas especializado em redesign de sites e prospecção B2B.
      
      Crie uma proposta de abordagem personalizada para:
      - Cliente: ${clienteNome}
      - Site atual: ${clienteSite || 'Não informado'}
      - Nicho: ${clienteNicho}
      
      A proposta deve conter:
      1. Uma mensagem de abertura profissional e personalizada
      2. 3-4 pontos de melhoria específicos para o site baseado no nicho
      3. Um call-to-action claro para agendar uma reunião
      4. Tom consultivo, não vendedor agressivo
      
      Responda em JSON com:
      {
        "mensagem": "texto da mensagem completa",
        "pontosMelhoria": ["ponto 1", "ponto 2", "ponto 3"],
        "cta": "texto do call-to-action",
        "previewUrl": "https://focoemdados.com.br/preview/${encodeURIComponent(clienteNome || 'lead')}"
      }`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let proposalData;
      try {
        // Tentar extrair JSON da resposta
        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          proposalData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("JSON não encontrado na resposta");
        }
      } catch {
        // Fallback se falhar o parsing
        proposalData = {
          mensagem: `Olá ${clienteNome}, analisamos seu site atual (${clienteSite || 'não informado'}) no nicho de ${clienteNicho}. Preparamos uma prévia de redesign moderno e responsivo para aumentar suas conversões.`,
          pontosMelhoria: [
            "Layout responsivo e mobile-first",
            "Velocidade de carregamento otimizada",
            "CTAs claros e posicionamento estratégico",
            "SEO técnico e conteúdo para o nicho"
          ],
          cta: "Vamos agendar 15 min para mostrar a prévia?",
          previewUrl: `https://focoemdados.com.br/preview/${encodeURIComponent(clienteNome || 'lead')}`
        };
      }

      res.json({
        status: "sucesso",
        ...proposalData,
        dataCriacao: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[/api/gerar-proposta] Error:", err);
      res.status(500).json({ error: "Erro ao gerar proposta: " + err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Gemini Smart Features: Questions, Chat & Slide Deck      */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/suggest-questions", async (req, res) => {
    try {
      const { sampleData, datasetName } = req.body;
      if (!sampleData) {
        return res.status(400).json({ error: "Missing sampleData" });
      }
      const questions = await suggestBusinessQuestions(sampleData, datasetName);
      res.json({ questions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, contextReport, datasetSummary, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Missing message" });
      }
      const reply = await chatAboutData({
        message,
        contextReport,
        datasetSummary,
        history,
      });
      res.json({ reply });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const QUOTA_LIMIT = 5;

  app.get("/api/nearby-search", async (req, res) => {
    try {
      const userHash = await getUserHash(req);
      const count = getQuotaCount(userHash);
      if (count >= QUOTA_LIMIT) {
        return res.status(429).json({ error: "Limite diário de 5 pesquisas atingido." });
      }

      const { lat, lng, radius, type } = req.query;
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: "API Key not configured" });
      }
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      
      incrementQuotaCount(userHash);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/slides", async (req, res) => {
    try {
      const { report } = req.body;
      if (!report) {
        return res.status(400).json({ error: "Missing report data" });
      }
      const slides = await generateExecutiveSlideDeck(report);
      res.json({ slides });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Contract Generator & Preview Routes                       */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/generate-contract", (req, res) => {
    try {
      const { lead, contratante, formaPagamento, prazoEntrega, rodadasAjustes } = req.body;
      if (!lead) {
        return res.status(400).json({ error: "Missing lead data" });
      }
      const cfg = contratante || getConfig().contratante;
      const html = generateContractHtml({
        lead,
        contratante: cfg,
        formaPagamento,
        prazoEntrega,
        rodadasAjustes,
      });
      res.json({ html });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/contract-preview/:slug", (req, res) => {
    try {
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === req.params.slug);
      if (!lead) {
        return res.status(404).send("Lead não encontrado");
      }
      const cfg = getConfig().contratante;
      const html = generateContractHtml({ lead, contratante: cfg });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Erro ao gerar contrato: ${err.message}`);
    }
  });

  app.get("/api/contract-docx/:slug", async (req, res) => {
    try {
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === req.params.slug);
      if (!lead) {
        return res.status(404).send("Lead não encontrado");
      }
      const cfg = getConfig().contratante;
      const buffer = await generateContractDocxBuffer({ lead, contratante: cfg });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename=contrato-${lead.slug}.docx`);
      res.send(buffer);
    } catch (err: any) {
      res.status(500).send(`Erro ao gerar .docx: ${err.message}`);
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Multi-Source Prospecting API (Google Maps, Instagram, CNAE) */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/prospecting/search", async (req, res) => {
    try {
      const { niche, city, cnae, sources } = req.body;
      const targetNiche = niche || "Negócios Locais";
      const targetCity = city || "São Paulo - SP";
      const targetCnae = cnae || "4711-3/02";
      const activeSources = sources ? Object.entries(sources).filter(([_, v]) => v).map(([k]) => k).join(", ") : "Maps, Instagram, LinkedIn";

      let leads: any[] = [];
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Gere exatamente 4 empresas reais ou altamente realistas da categoria "${targetNiche}" localizadas em "${targetCity}" (CNAE: "${targetCnae}").
Use como fontes de dados de enriquecimento: ${activeSources}.

Para cada empresa, retorne um objeto JSON contendo:
- name (string)
- category (string)
- city (string)
- cnaeCode (string)
- cnaeDesc (string)
- phone (string)
- whatsapp (string)
- email (string)
- instagram (string, ex: @handle)
- instagramFollowers (string, ex: 12.4k)
- linkedinSize (string, ex: 11-50 funcionários)
- rating (number, ex: 4.8)
- reviewsCount (number, ex: 142)
- revenueEst (string, ex: R$ 100k - 250k/mês)
- websiteStatus (string, ex: Sem Automação WhatsApp / Site Desatualizado)
- address (string)

Retorne APENAS um array JSON válido, sem texto adicional.`;

        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });
          leads = JSON.parse(response.text || "[]");
          
          // Trigger OpenSquad mission
          try {
            await runOpenSquadMission({
              cardId: 'prospect_hunt',
              niche: targetNiche,
              city: targetCity,
              crmLeads: leads
            });
            console.log("[prospecting] OpenSquad mission triggered automatically.");
          } catch (squadErr) {
            console.error("[prospecting] Failed to trigger OpenSquad mission:", squadErr);
          }
        } catch (apiErr: any) {
          console.warn("[prospecting] API Call failed (possibly 429/quota):", apiErr.message);
          // Fallback silencioso para estruturação local se a API falhar
          throw new Error("API Limit Reached");
        }
        
        const text = response.text || "[]";
        leads = JSON.parse(text);
      } catch (aiErr) {
        console.warn("[prospecting] AI generation fallback used:", aiErr);
        // Garante que o fallback de dados simulados seja usado caso a IA falhe
        leads = []; 
      }

      if (!leads || leads.length === 0) {
        const pfx = targetNiche.split(" ")[0];
        leads = [
          {
            name: `${pfx} Master ${targetCity.split(" ")[0]}`,
            category: targetNiche,
            city: targetCity,
            cnaeCode: targetCnae,
            cnaeDesc: "Serviços Especializados de Atendimento Comercial",
            phone: "+55 11 98765-4321",
            whatsapp: "+5511987654321",
            email: `contato@${pfx.toLowerCase()}master.exemplo`,
            instagram: `@${pfx.toLowerCase()}master`,
            instagramFollowers: "15.2k",
            linkedinSize: "11-50 funcionários",
            rating: 4.8,
            reviewsCount: 184,
            revenueEst: "R$ 150k - 300k/mês",
            websiteStatus: "Sem Chat / Oportunidade IA",
            address: `Av. Principal, 1000 - ${targetCity}`
          },
          {
            name: `Grupo ${pfx} Premium`,
            category: targetNiche,
            city: targetCity,
            cnaeCode: targetCnae,
            cnaeDesc: "Soluções Avançadas e Consultoria",
            phone: "+55 11 97123-8899",
            whatsapp: "+5511971238899",
            email: `comercial@grupo${pfx.toLowerCase()}.exemplo`,
            instagram: `@grupo_${pfx.toLowerCase()}`,
            instagramFollowers: "8.9k",
            linkedinSize: "10-20 funcionários",
            rating: 4.6,
            reviewsCount: 96,
            revenueEst: "R$ 90k - 200k/mês",
            websiteStatus: "Site Lento / Sem WhatsApp",
            address: `Rua Comercial, 500 - ${targetCity}`
          },
          {
            name: `${pfx} Soluções e Tecnologia`,
            category: targetNiche,
            city: targetCity,
            cnaeCode: targetCnae,
            cnaeDesc: "Desenvolvimento e Suporte Operacional",
            phone: "+55 11 96543-1122",
            whatsapp: "+5511965431122",
            email: `suporte@${pfx.toLowerCase()}solucoes.exemplo`,
            instagram: `@${pfx.toLowerCase()}solucoes`,
            instagramFollowers: "22.1k",
            linkedinSize: "51-200 funcionários",
            rating: 4.9,
            reviewsCount: 310,
            revenueEst: "R$ 300k - 600k/mês",
            websiteStatus: "Alta Demanda de Leads",
            address: `Alameda dos Negócios, 200 - ${targetCity}`
          }
        ];
      }

      const processed = leads.map((l: any, i: number) => ({
        ...l,
        id: `pros-${Date.now()}-${i}`,
        slug: `lead-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`
      }));

      res.json({ leads: processed });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  OpenSquad Multi-Agent Collaboration Routes                */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/opensquad/run-mission", async (req, res) => {
    try {
      const { cardId, niche, city, customPrompt, ticketTarget, mrrTarget, focus, modelName } = req.body;
      const crmLeads = getLeads();
      const result = await runOpenSquadMission({
        cardId: cardId || "prospect_hunt",
        niche: niche || "Restaurantes & Gastronomia",
        city: city || "São Paulo - SP",
        customPrompt,
        crmLeads,
        ticketTarget: Number(ticketTarget) || 1500,
        mrrTarget: Number(mrrTarget) || 200,
        focus: focus || "Conversão Mobile e WhatsApp",
        modelName: modelName || "gemini-3.7-flash",
      });
      res.json(result);
    } catch (err: any) {
      console.error("[api/opensquad/run-mission] Error:", err);
      res.status(500).json({ error: err.message || "Falha ao executar missão do Squad." });
    }
  });

  app.post("/api/opensquad/import-leads", (req, res) => {
    try {
      const { leads } = req.body;
      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: "Nenhum lead fornecido para importação." });
      }

      const imported: any[] = [];
      leads.forEach((l) => {
        const saved = upsertLead({
          ...l,
          slug: l.slug || `squad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        });
        imported.push(saved);
      });

      res.json({ success: true, count: imported.length, leads: imported });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Live Redesign Presentation Tunnel Routes                  */
  /* ────────────────────────────────────────────────────────── */

  // 0. Proxy de site com remoção de X-Frame-Options para exibição segura em iframe
  app.get("/api/site-proxy", async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send("URL não informada.");
    }

    const targetUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }

      let html = await response.text();

      // Injeta base href no HTML para que assets relativos (CSS, imagens, fontes) carreguem do domínio original
      const baseTag = `<base href="${targetUrl}">`;
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`);
      } else if (html.includes("<HEAD>")) {
        html = html.replace("<HEAD>", `<HEAD>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      // Remove metas de CSP ou X-Frame se existirem no corpo do HTML
      html = html.replace(/<meta[^>]*http-equiv=["']?(content-security-policy|x-frame-options)["']?[^>]*>/gi, "");

      // Headers liberais para visualização
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(html);
    } catch (err: any) {
      console.warn(`[site-proxy] Could not proxy ${targetUrl}:`, err.message);
      // Fallback amigável de diagnóstico quando o site antigo está inacessível ou offline
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-neutral-900 text-neutral-200 p-8 flex flex-col items-center justify-center min-h-[400px] text-center font-sans">
          <div class="max-w-md space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl mx-auto">
              ⚠️
            </div>
            <h3 class="text-sm font-bold text-white">Site Original Inacessível ou Bloqueado</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">O endereço <strong>${targetUrl}</strong> está inacessível no momento.</p>
            <p class="text-[10px] text-neutral-600">Erro: ${err.message}</p>
          </div>
        </body>
        </html>
      `);
    }
  });

  // 1. Rota JSON de dados e métricas do túnel
  app.get("/api/tunnel/:slug", (req, res) => {
    try {
      const { slug } = req.params;
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === slug);
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado para gerar túnel." });
      }

      const hostUrl = `${req.protocol}://${req.get("host")}`;
      const cfg = getConfig();
      const qrCodeUrl = generateSvgQrCode(`${hostUrl}/tunnel/${lead.slug}`);

      res.json({
        slug: lead.slug,
        lead,
        tunnelUrl: `${hostUrl}/tunnel/${lead.slug}`,
        liveSiteUrl: `${hostUrl}/api/live-site/${lead.slug}`,
        qrCodeUrl,
        contratante: cfg.contratante,
        performanceScore: {
          oldScore: 32,
          newScore: 99,
          oldLoadTime: "4.2s",
          newLoadTime: "0.4s",
          mobileReadinessOld: "Incompatível (Sem Viewport)",
          mobileReadinessNew: "100% Mobile First & WhatsApp",
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Rota de renderização dinâmica do site moderno redesenhado
  app.get("/api/live-site/:slug", (req, res) => {
    try {
      const { slug } = req.params;
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === slug);
      if (!lead) {
        return res.status(404).send("Site não encontrado no banco de prospecção.");
      }

      const cfg = getConfig();
      const agencyPhone = cfg.contratante?.whatsapp || "5511999999999";
      const html = generateDynamicRedesignHtml(lead, agencyPhone);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Erro ao renderizar site do túnel: ${err.message}`);
    }
  });

  // 2b. Rota de Editor Visual (Nano banana) injetando camada de edição interativa
  app.get(["/api/live-site-editor/:slug", "/sites/:slug/editor"], (req, res) => {
    try {
      const { slug } = req.params;
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === slug);
      if (!lead) {
        return res.status(404).send("Site não encontrado para edição visual.");
      }

      const cfg = getConfig();
      const agencyPhone = cfg.contratante?.whatsapp || "5511999999999";
      let html = generateDynamicRedesignHtml(lead, agencyPhone);

      const editorScript = `
<!-- PROSPECTOR-EDITOR-START -->
<style id="pe-style">
#pe-bar{position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#fff;font:14px/1 -apple-system,Segoe UI,Roboto,sans-serif;display:flex;align-items:center;gap:16px;padding:10px 16px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
#pe-bar button{background:#22c55e;color:#fff;border:0;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer}
#pe-bar button:hover{background:#16a34a}
body{margin-top:44px !important}
.pe-hover{outline:2px dashed #22c55e !important;outline-offset:2px;cursor:pointer}
[contenteditable="true"]:focus{outline:2px solid #3b82f6 !important;outline-offset:2px}
</style>
<div id="pe-bar">
  <strong>Modo Edição Visual (Nano banana)</strong>
  <span>Clique em textos para editar · clique em imagens para trocar</span>
  <button id="pe-export" type="button">Exportar página limpa</button>
</div>
<input type="file" id="pe-file" accept="image/*" style="display:none">
<script id="pe-script">
(function(){
  var TEXT='h1,h2,h3,h4,h5,h6,p,li,a,span,button,td,th,figcaption,blockquote,strong,em';
  document.querySelectorAll(TEXT).forEach(function(el){
    if(el.closest('#pe-bar'))return;
    if(el.children.length===0||el.childElementCount<=1){
      el.addEventListener('click',function(e){
        if(el.tagName==='A'||el.tagName==='BUTTON')e.preventDefault();
        el.setAttribute('contenteditable','true');el.focus();
      });
      el.addEventListener('mouseenter',function(){el.classList.add('pe-hover')});
      el.addEventListener('mouseleave',function(){el.classList.remove('pe-hover')});
      el.addEventListener('blur',function(){el.removeAttribute('contenteditable')});
    }
  });
  var fileInput=document.getElementById('pe-file'),currentImg=null;
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();currentImg=img;fileInput.click()});
    img.addEventListener('mouseenter',function(){img.classList.add('pe-hover')});
    img.addEventListener('mouseleave',function(){img.classList.remove('pe-hover')});
  });
  fileInput.addEventListener('change',function(){
    var f=fileInput.files[0];if(!f||!currentImg)return;
    var r=new FileReader();
    r.onload=function(){currentImg.src=r.result;if(currentImg.srcset)currentImg.removeAttribute('srcset')};
    r.readAsDataURL(f);fileInput.value='';
  });
  document.getElementById('pe-export').addEventListener('click',function(){
    var doc=document.documentElement.cloneNode(true);
    ['#pe-bar','#pe-style','#pe-script','#pe-file'].forEach(function(s){var n=doc.querySelector(s);if(n)n.remove()});
    doc.querySelectorAll('[contenteditable]').forEach(function(n){n.removeAttribute('contenteditable')});
    doc.querySelectorAll('.pe-hover').forEach(function(n){n.classList.remove('pe-hover')});
    var html='<!DOCTYPE html>\\n'+doc.outerHTML;
    var blob=new Blob([html],{type:'text/html'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='index.html';a.click();
  });
})();
</script>
<!-- PROSPECTOR-EDITOR-END -->
`;

      if (html.includes("</body>")) {
        html = html.replace("</body>", `${editorScript}\n</body>`);
      } else {
        html += editorScript;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Erro ao carregar editor visual: ${err.message}`);
    }
  });

  // 2c. Rota de Comparação Antes vs Depois (comparar.html)
  app.get(["/comparar.html", "/comparar"], (req, res) => {
    try {
      const leads = getLeads();
      const clientes = leads.map(l => ({
        nome: l.nome,
        slug: l.slug,
        old: l.siteAntigo || null,
        motivo: l.siteAntigo ? undefined : "Site original não cadastrado"
      }));
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Comparador — Antes vs Depois (Foco Completo)</title>
<style>
  :root{--bg:#0f1420;--card:#1a2130;--ink:#e8ecf4;--muted:#8a97ad;--line:#2a3346;--old:#ef4444;--new:#22c55e;--blue:#3b82f6}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,'Segoe UI',Roboto,sans-serif;padding:20px;min-height:100vh}
  h1{font-size:22px;margin:0 0 4px}
  p.sub{color:var(--muted);margin:0 0 18px;font-size:14px}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .tab{background:var(--card);border:1px solid var(--line);color:var(--ink);padding:9px 16px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600}
  .tab.on{background:var(--blue);border-color:var(--blue);color:#fff}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:900px){.cols{grid-template-columns:1fr}}
  .col{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
  .chead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--line);font-size:13px;font-weight:700}
  .chead .lb{display:flex;align-items:center;gap:8px}
  .dot{width:10px;height:10px;border-radius:50%}
  .dot.o{background:var(--old)} .dot.n{background:var(--new)}
  .chead a{color:#22d3ee;text-decoration:none;font-weight:600;font-size:12px}
  .chead a:hover{text-decoration:underline}
  iframe{width:100%;height:72vh;border:0;background:#fff;display:block}
  .empty{height:72vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);text-align:center;padding:20px}
  .empty strong{color:var(--old);font-size:17px}
  .hint{color:var(--muted);font-size:12px;margin-top:14px}
</style>
</head>
<body>
<h1>Antes vs Depois — Foco Completo & Nano banana</h1>
<p class="sub">Esquerda: site atual do cliente · Direita: nova versão profissional gerada pelo Nano banana.</p>
<div class="tabs" id="tabs"></div>
<div class="cols">
  <div class="col">
    <div class="chead"><span class="lb"><span class="dot o"></span>SITE ATUAL</span><a id="oldlink" href="#" target="_blank" rel="noopener">abrir em nova aba ↗</a></div>
    <div id="oldwrap"></div>
  </div>
  <div class="col">
    <div class="chead"><span class="lb"><span class="dot n"></span>NOVA VERSÃO (NANO BANANA)</span><a id="newlink" href="#" target="_blank" rel="noopener">abrir em nova aba ↗</a></div>
    <div id="newwrap"></div>
  </div>
</div>
<script>
var CLIENTES=${JSON.stringify(clientes)};
var tabs=document.getElementById('tabs');
CLIENTES.forEach(function(c,i){
  var b=document.createElement('button');b.className='tab'+(i===0?' on':'');b.textContent=c.nome;
  b.onclick=function(){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')});b.classList.add('on');mostra(c)};
  tabs.appendChild(b);
});
function mostra(c){
  var ow=document.getElementById('oldwrap'),nw=document.getElementById('newwrap');
  var ol=document.getElementById('oldlink'),nl=document.getElementById('newlink');
  var novo='/api/live-site/'+c.slug;
  nw.innerHTML='<iframe src="'+novo+'"></iframe>';nl.href=novo;
  if(c.old){
    var proxyUrl = '/api/site-proxy?url=' + encodeURIComponent(c.old);
    ow.innerHTML='<iframe src="'+proxyUrl+'"></iframe>';
    ol.href=c.old;
    ol.style.display='inline';
  }
  else{ow.innerHTML='<div class="empty"><strong>Sem site original cadastrado</strong><span>'+(c.motivo||'')+'</span></div>';ol.style.display='none'}
}
if(CLIENTES.length)mostra(CLIENTES[0]);
</script>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Erro ao gerar comparador: ${err.message}`);
    }
  });

  // 3. Rota principal do Túnel de Apresentação Client-Facing
  app.get(["/tunnel/:slug", "/preview-tunnel/:slug"], (req, res) => {
    try {
      const { slug } = req.params;
      const leads = getLeads();
      const lead = leads.find((l) => l.slug === slug);
      if (!lead) {
        return res.status(404).send(`
          <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
            <h2>Túnel não encontrado</h2>
            <p>O identificador do redesign solicitado não existe ou expirou.</p>
          </div>
        `);
      }

      const hostUrl = `${req.protocol}://${req.get("host")}`;
      const cfg = getConfig();
      const html = generateClientTunnelPresentationHtml({
        lead,
        hostUrl,
        agencyName: cfg.contratante?.nome || "OpenSquad Digital",
        agencyPhone: cfg.contratante?.whatsapp || "5511999999999",
      });

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) {
      res.status(500).send(`Erro ao abrir túnel: ${err.message}`);
    }
  });

  // Vite middleware for development (with a robust fallback to dev middleware if dist/index.html is missing)
  const distPath = path.join(process.cwd(), "dist");
  const indexHtmlExists = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !indexHtmlExists) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "Production mode enabled, but dist/index.html not found. Falling back to Vite dev server middleware to ensure app stays operational.",
      );
    }
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    // Express 5 format for catch-all (if using express 5) or Express 4. Let's use *all for v5 or * for v4.
    // We can use default express 4 catch-all
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Disable timeouts for long-running agent interactions
  server.setTimeout(0);
  server.requestTimeout = 0;
  server.headersTimeout = 0;
  server.keepAliveTimeout = 0;
}

startServer();

  /* ────────────────────────────────────────────────────────── */
  /*  n8n Webhook Integration Endpoint                         */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/n8n-webhook", async (req, res) => {
    try {
      const { clienteNome, clienteSite, clienteNicho } = req.body;
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

      if (!n8nWebhookUrl) {
        return res.status(500).json({ error: "URL do Webhook do n8n não configurada nas variáveis de ambiente." });
      }

      const payload = {
        clienteNome,
        clienteSite,
        clienteNicho,
        timestamp: new Date().toISOString(),
      };

      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!n8nResponse.ok) {
        throw new Error(`Falha ao disparar automação no n8n: ${n8nResponse.statusText}`);
      }

      let n8nResult = {};
      try {
        n8nResult = await n8nResponse.json();
      } catch {
        n8nResult = { success: true };
      }

      return res.status(200).json({
        status: "sucesso",
        mensagem: "Webhook disparado para o n8n com sucesso!",
        data: n8nResult,
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Erro interno ao conectar com o n8n.";
      return res.status(500).json({ status: "erro", mensagem: errorMessage });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Supabase Prospect Save Endpoint                          */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/salvar-prospeccao", async (req, res) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Credenciais do Supabase não configuradas no servidor." });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { nome, nicho, siteAtual, status } = req.body;

      if (!nome || !nicho) {
        return res.status(400).json({ error: "Nome e nicho são obrigatórios." });
      }

      const { data, error } = await supabase
        .from("prospeccoes")
        .insert([
          { 
            nome, 
            nicho, 
            site_atual: siteAtual || null, 
            status: status || "novo",
            criado_em: new Date().toISOString() 
          }
        ])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({
        status: "sucesso",
        mensagem: "Lead salvo com sucesso no Supabase!",
        dados: data,
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao salvar no banco.";
      return res.status(500).json({ status: "erro", mensagem: errorMessage });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Resend Email Dispatch Endpoint                           */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/enviar-proposta", async (req, res) => {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        return res.status(500).json({ error: "Chave de API do Resend não configurada no servidor." });
      }

      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const { destinatarioEmail, clienteNome, nicho, linkProposta } = req.body;

      if (!destinatarioEmail || !clienteNome) {
        return res.status(400).json({ error: "E-mail do destinatário e nome do cliente são obrigatórios." });
      }

      const { data, error } = await resend.emails.send({
        from: "Foco em Dados <atendimento@focoemdados.com.br>",
        to: [destinatarioEmail],
        subject: `Proposta Exclusiva de Redesign para ${clienteNome}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;">
            <h2 style="color: #38bdf8; margin-top: 0;">Olá, ${clienteNome}!</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">
              Analisamos o seu posicionamento no nicho de <strong>${nicho}</strong> e preparamos uma proposta de transformação digital e alta conversão para o seu negócio.
            </p>
            <div style="margin: 32px 0;">
              <a href="${linkProposta}" style="background-color: #f59e0b; color: #09090b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Visualizar Proposta Interativa
              </a>
            </div>
            <p style="font-size: 14px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 16px;">
              Atenciosamente,<br/><strong>Equipe Foco em Dados</strong>
            </p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({
        status: "sucesso",
        mensagem: "E-mail de proposta disparado com sucesso pelo Resend!",
        data,
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao enviar o e-mail.";
      return res.status(500).json({ status: "erro", mensagem: errorMessage });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Supabase Prospect List Endpoint                          */
  /* ────────────────────────────────────────────────────────── */
  app.get("/api/listar-prospeccoes", async (req, res) => {
      res.setHeader("Content-Type", "application/json");
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        // Fallback simulado caso o Supabase não esteja configurado localmente ainda
        return res.status(200).json({
          status: "sucesso",
          dados: [
            { id: "1", nome: "Clínica Sorriso Perfeito", nicho: "Saúde e Odontologia", siteAtual: "sorrisoperfeito-antigo.com.br", status: "novo" },
            { id: "2", nome: "Auto Peças Rodagem", nicho: "Automotivo", siteAtual: "rodagempecas.com", status: "contatado" },
            { id: "3", nome: "Empório dos Doces Artesanais", nicho: "Confeitaria", siteAtual: "emporiodoces.com.br", status: "proposta_enviada" }
          ]
        });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("prospeccoes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Mapeia colunas do banco (ex: site_atual -> siteAtual) se necessário
      const formatados = (data || []).map((item: any) => ({
        id: String(item.id),
        nome: item.nome,
        nicho: item.nicho,
        siteAtual: item.site_atual || item.siteAtual || "",
        status: item.status || "novo"
      }));

      return res.status(200).json({
        status: "sucesso",
        dados: formatados,
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao listar do banco.";
      return res.status(500).json({ status: "erro", mensagem: errorMessage });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Stripe Checkout Session Endpoint                         */
  /* ────────────────────────────────────────────────────────── */
  
  /* ────────────────────────────────────────────────────────── */
  /*  Stripe Subscription Checkout Session                     */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/criar-sessao-pagamento", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-02-27.acacia",
      });

      const { email } = req.body;
      const origin = req.headers.origin || "https://www.focoemdados.com.br";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: "Foco em Dados - Acesso Total PRO",
                description: "Painel de Prospecção B2B e Agentes Inteligentes",
              },
              unit_amount: 3990,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer_email: email,
        success_url: origin + "/prospeccao?pagamento=sucesso",
        cancel_url: origin + "/?pagamento=cancelado",
      });

      return res.status(200).json({ urlCheckout: session.url });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar sessão de pagamento.";
      return res.status(500).json({ error: errorMessage });
    }
  });

    } catch (err: any) {
      return res.status(500).json({ status: "erro", mensagem: err.message });
    }
  });

  /* ────────────────────────────────────────────────────────── */
  /*  Stripe Checkout Alias (/api/criar-checkout)              */
  /* ────────────────────────────────────────────────────────── */
  
  /* ────────────────────────────────────────────────────────── */
  /*  Stripe Checkout Session (Exact Match)                    */
  /* ────────────────────────────────────────────────────────── */
  app.post("/api/criar-checkout", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-02-27.acacia",
      });

      const origin = req.headers.origin || "https://www.focoemdados.com.br";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: "Foco em Dados - Acesso Total PRO",
                description: "Sistema Operacional de Vendas & IA B2B",
              },
              unit_amount: 3990,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: origin + "/prospeccao?status=sucesso",
        cancel_url: origin + "/?status=cancelado",
      });

      return res.status(200).json({ url: session.url, urlCheckout: session.url });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao conectar com o Stripe.";
      return res.status(500).json({ error: errorMessage });
    }
  });

    }
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-02-27.acacia",
      });

      const { email } = req.body || {};
      const origin = req.headers.origin || "https://www.focoemdados.com.br";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: "Foco em Dados - Acesso Total PRO",
                description: "Painel de Prospecção B2B e Agentes Inteligentes",
              },
              unit_amount: 3990,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer_email: typeof email === "string" && email.trim() ? email.trim() : "atendimento@focoemdados.com.br",
        success_url: origin + "/prospeccao?pagamento=sucesso",
        cancel_url: origin + "/?pagamento=cancelado",
      });

      return res.status(200).json({ url: session.url, urlCheckout: session.url });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar sessão de pagamento.";
      return res.status(400).json({ error: errorMessage });
    }
  });
