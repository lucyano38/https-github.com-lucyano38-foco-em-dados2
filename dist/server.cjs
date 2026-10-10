var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_papaparse = __toESM(require("papaparse"), 1);
var import_xlsx = __toESM(require("xlsx"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_app2 = require("firebase-admin/app");
var import_firestore2 = require("firebase-admin/firestore");
var import_auth = require("firebase-admin/auth");
var import_crypto = __toESM(require("crypto"), 1);
var import_stripe = __toESM(require("stripe"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/routes/auth.ts
var import_express = require("express");

// src/config/firebase.ts
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
try {
  if (!(0, import_app.getApps)().length) {
    (0, import_app.initializeApp)();
  }
} catch (error) {
  console.log("Firebase Admin initialization skipped or failed in config:", error);
}
var db = (0, import_firestore.getFirestore)();

// src/routes/auth.ts
var router = (0, import_express.Router)();
router.post("/register", async (req, res) => {
  const { name, email, uid } = req.body;
  try {
    let userRole = "Gratuito";
    if (email === "lucyano.pci@gmail.com") {
      userRole = "Master";
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
      role: userRole,
      createdAt: /* @__PURE__ */ new Date(),
      stripeCustomerId: null
      // Será preenchido quando ele assinar
    });
    return res.status(201).json({
      success: true,
      message: "Usu\xE1rio registrado com sucesso!",
      role: userRole
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erro ao salvar no banco." });
  }
});
var auth_default = router;

// server.ts
try {
  if (!(0, import_app2.getApps)().length) {
    (0, import_app2.initializeApp)();
  }
} catch (error) {
  console.log("Firebase Admin initialization skipped (needs credentials in production).");
}
var db2 = (0, import_app2.getApps)().length ? (0, import_firestore2.getFirestore)() : null;
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
function tryParseNumber(val) {
  if (val === null || val === void 0 || val === "") return null;
  if (typeof val === "number") return val;
  if (typeof val !== "string") return null;
  let cleaned = val.replace(/[\sR\$\€\£\%\a-zA-Z]/g, "").trim();
  if (cleaned === "") return null;
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, "");
  } else if (lastComma !== -1) {
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount === 1) {
      cleaned = cleaned.replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  }
  const parsed = Number(cleaned);
  return isNaN(parsed) ? null : parsed;
}
async function startServer() {
  const app = (0, import_express2.default)();
  app.use((0, import_cors.default)());
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  const getAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave GEMINI_API_KEY n\xE3o foi configurada nas vari\xE1veis de ambiente. Por favor, adicione-a.");
    }
    return new import_genai.GoogleGenAI({ apiKey: key });
  };
  const generateContentWithRetryAndFallback = async (params) => {
    const primary = params.model || "gemini-2.0-flash";
    const second = "gemini-flash-latest";
    const third = params.fallbackModel || "gemini-3.1-flash-lite";
    const modelsToTry = [primary];
    if (!modelsToTry.includes(second)) modelsToTry.push(second);
    if (!modelsToTry.includes(third)) modelsToTry.push(third);
    let lastError = null;
    for (const currentModel of modelsToTry) {
      let delay = 800;
      const maxAttemptsForModel = 2;
      for (let attempt = 0; attempt < maxAttemptsForModel; attempt++) {
        try {
          console.log(`[Gemini API] Tentando gerar conte\xFAdo com o modelo: ${currentModel} (Tentativa ${attempt + 1}/${maxAttemptsForModel})`);
          const result = await getAI().models.generateContent({
            model: currentModel,
            contents: params.contents,
            config: params.config
          });
          console.log(`[Gemini API] Sucesso com o modelo: ${currentModel}`);
          return result;
        } catch (error) {
          lastError = error;
          const status = error.status || error.code || error.response && error.response.status;
          const isTransient = status === "UNAVAILABLE" || status === 503 || error.message && error.message.includes("503") || error.message && error.message.includes("UNAVAILABLE");
          console.warn(`[Gemini API] Erro no modelo ${currentModel} (Tentativa ${attempt + 1}/${maxAttemptsForModel}):`, error.message || error);
          if (attempt < maxAttemptsForModel - 1 && isTransient) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            break;
          }
        }
      }
    }
    throw lastError || new Error("Todos os modelos Gemini do fallback falharam.");
  };
  let stripe = null;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  let operacaoModo = "N\xC3O CONFIGURADO (Chave ausente)";
  if (stripeKey) {
    stripe = new import_stripe.default(stripeKey, { apiVersion: "2023-10-16" });
    if (stripeKey.startsWith("sk_live")) {
      operacaoModo = "LIVE";
    } else if (stripeKey.startsWith("sk_test")) {
      operacaoModo = "TEST";
    } else {
      operacaoModo = "CONFIGURA\xC7\xC3O INV\xC1LIDA";
    }
  }
  console.log(`Modo de Opera\xE7\xE3o: ${operacaoModo}`);
  app.post("/api/webhooks/stripe", import_express2.default.raw({ type: "application/json" }), async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripe || !endpointSecret || !sig || typeof sig !== "string") {
        return res.status(400).send("Stripe n\xE3o configurado corretamente.");
      }
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      if (!db2) return res.status(200).send("Ignorado (sem DB)");
      const usersRef = db2.collection("users");
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const email = session.customer_details?.email || session.customer_email;
        if (email) {
          const snapshot = await usersRef.where("email", "==", email).limit(1).get();
          if (snapshot.empty) {
            await usersRef.add({
              email,
              plan: "pro",
              quotaUsed: 0,
              createdAt: import_firestore2.FieldValue.serverTimestamp()
            });
          } else {
            await snapshot.docs[0].ref.update({ plan: "pro" });
          }
        }
      } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        if (email) {
          const snapshot = await usersRef.where("email", "==", email).limit(1).get();
          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({ plan: "free" });
          }
        }
      }
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe Webhook Error:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });
  app.post("/api/prospectar", async (req, res) => {
    try {
      const { niche, city, radius } = req.body;
      if (!niche || !city) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios ausentes: niche e city" });
      }
      const results = await prospectarEstabelecimentos(niche, city, radius || 50);
      res.json({
        success: true,
        niche,
        city,
        radius: radius || 50,
        totalEncontrados: results.length,
        resultados: results,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Erro na prospecta\xE7\xE3o:", error);
      res.status(500).json({ error: error.message || "Erro interno na prospecta\xE7\xE3o." });
    }
  });
  app.use(import_express2.default.json());
  app.use("/api/auth", auth_default);
  app.get("/api/stripe/config", (req, res) => {
    if (!stripe) {
      return res.status(400).json({
        success: false,
        error: "Stripe n\xE3o configurado no servidor. Por favor, adicione a chave secreta (STRIPE_SECRET_KEY) nas configura\xE7\xF5es.",
        mode: "N\xC3O CONFIGURADO"
      });
    }
    return res.json({
      success: true,
      mode: stripeKey?.startsWith("sk_live") ? "LIVE" : "TEST"
    });
  });
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({
          success: false,
          error: "O gateway de pagamento Stripe n\xE3o est\xE1 configurado. Por favor, adicione a sua chave secreta (STRIPE_SECRET_KEY) para ativar o checkout seguro."
        });
      }
      const { priceId, successUrl, cancelUrl } = req.body;
      if (!priceId) {
        return res.status(400).json({
          success: false,
          error: "ID de pre\xE7o do Stripe (priceId) \xE9 obrigat\xF3rio."
        });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: successUrl || `${req.protocol}://${req.get("host")}/?success=true`,
        cancel_url: cancelUrl || `${req.protocol}://${req.get("host")}/?canceled=true`
      });
      return res.json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (err) {
      console.error("[Stripe] Erro ao criar sess\xE3o de checkout:", err);
      return res.status(500).json({
        success: false,
        error: `Erro ao iniciar checkout: ${err.message || "Erro no gateway Stripe."}`
      });
    }
  });
  app.post("/api/webhooks/kiwify", async (req, res) => {
    try {
      const signature = req.headers["x-kiwify-signature"];
      const kiwifyWebhookSecret = process.env.KIWIFY_WEBHOOK_SECRET || "SEU_TOKEN_AQUI";
      if (signature) {
        const payload = JSON.stringify(req.body);
        const hash = import_crypto.default.createHmac("sha1", kiwifyWebhookSecret).update(payload).digest("hex");
        if (hash !== signature) {
          return res.status(401).json({ error: "Assinatura inv\xE1lida." });
        }
      }
      const { order_status, Customer } = req.body;
      const email = Customer?.email;
      if (!email || !db2) return res.status(200).send("Ignorado (sem email ou sem DB)");
      const usersRef = db2.collection("users");
      const snapshot = await usersRef.where("email", "==", email).limit(1).get();
      if (order_status === "approved") {
        if (snapshot.empty) {
          await usersRef.add({
            email,
            plan: "pro",
            quotaUsed: 0,
            createdAt: import_firestore2.FieldValue.serverTimestamp()
          });
        } else {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ plan: "pro" });
        }
      } else if (order_status === "refunded" || order_status === "chargedback") {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ plan: "free" });
        }
      }
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Kiwify Webhook Error:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });
  app.post("/api/webhooks/hotmart", async (req, res) => {
    try {
      const hottok = req.headers["x-hotmart-hottok"];
      const hotmartWebhookSecret = process.env.HOTMART_HOTTOK || "SEU_HOTTOK_AQUI";
      if (hottok !== hotmartWebhookSecret) {
        return res.status(401).json({ error: "Token Hottok inv\xE1lido." });
      }
      const event = req.body.event;
      const email = req.body.data?.buyer?.email;
      if (!email || !db2) return res.status(200).send("Ignorado (sem email ou sem DB)");
      const usersRef = db2.collection("users");
      const snapshot = await usersRef.where("email", "==", email).limit(1).get();
      if (event === "PURCHASE_APPROVED") {
        if (snapshot.empty) {
          await usersRef.add({
            email,
            plan: "pro",
            quotaUsed: 0,
            createdAt: import_firestore2.FieldValue.serverTimestamp()
          });
        } else {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ plan: "pro" });
        }
      } else if (event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED") {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ plan: "free" });
        }
      }
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Hotmart Webhook Error:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });
  const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Token de autentica\xE7\xE3o n\xE3o fornecido ou inv\xE1lido." });
        }
        const idToken = authHeader.split("Bearer ")[1];
        if (!(0, import_app2.getApps)().length) {
          console.warn("Firebase Admin n\xE3o inicializado. Ignorando valida\xE7\xE3o de token.");
          return res.status(503).json({ error: "Servi\xE7o de autentica\xE7\xE3o temporariamente indispon\xEDvel." });
        }
        const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
        const email = decodedToken.email || "";
        const uid = decodedToken.uid;
        const isLucyano = email.toLowerCase() === "lucyano.pci@gmail.com";
        req.user = {
          uid,
          email,
          role: isLucyano ? "Master" : "User"
          // default
        };
        if (db2) {
          const userDoc = await db2.collection("users").doc(uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            req.user.role = isLucyano ? "Master" : userData?.role || "User";
            if (isLucyano && (userData?.role !== "Master" || userData?.plan !== "pro")) {
              await db2.collection("users").doc(uid).set({ role: "Master", plan: "pro" }, { merge: true });
            }
          } else if (isLucyano) {
            await db2.collection("users").doc(uid).set({
              email,
              role: "Master",
              plan: "pro",
              quotaUsed: 0,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            error: `Acesso negado. Esta rota requer privil\xE9gios de: [${allowedRoles.join(", ")}]. Sua role atual \xE9: ${req.user.role}`
          });
        }
        next();
      } catch (error) {
        console.error("Erro no middleware RBAC:", error);
        return res.status(401).json({ error: "N\xE3o autorizado ou token expirado." });
      }
    };
  };
  const requirePremiumOrMaster = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token de autentica\xE7\xE3o n\xE3o fornecido ou inv\xE1lido." });
      }
      const idToken = authHeader.split("Bearer ")[1];
      if (!(0, import_app2.getApps)().length) {
        console.warn("Firebase Admin n\xE3o inicializado. Ignorando valida\xE7\xE3o.");
        return res.status(503).json({ error: "Servi\xE7o de autentica\xE7\xE3o temporariamente indispon\xEDvel." });
      }
      const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
      const email = decodedToken.email || "";
      const uid = decodedToken.uid;
      const isLucyano = email.toLowerCase() === "lucyano.pci@gmail.com";
      let role = isLucyano ? "Master" : "User";
      let plan = isLucyano ? "pro" : "free";
      if (db2) {
        const userDoc = await db2.collection("users").doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          role = isLucyano ? "Master" : userData?.role || "User";
          plan = isLucyano ? "pro" : userData?.plan || "free";
          if (isLucyano && (userData?.role !== "Master" || userData?.plan !== "pro")) {
            await db2.collection("users").doc(uid).set({ role: "Master", plan: "pro" }, { merge: true });
          }
        } else if (isLucyano) {
          await db2.collection("users").doc(uid).set({
            email,
            role: "Master",
            plan: "pro",
            quotaUsed: 0,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      req.user = { uid, email, role, plan };
      if (plan === "pro" || role === "Master") {
        return next();
      }
      return res.status(403).json({
        error: "Este recurso est\xE1 dispon\xEDvel apenas no plano Premium. Descubra o que seus concorrentes est\xE3o fazendo na internet em tempo real e compare com seus dados de precifica\xE7\xE3o. Fa\xE7a o upgrade agora!"
      });
    } catch (error) {
      console.error("Erro no middleware Premium Paywall:", error);
      return res.status(401).json({ error: "N\xE3o autorizado ou token expirado." });
    }
  };
  app.post("/api/premium/web-search-compare", requirePremiumOrMaster, async (req, res) => {
    try {
      const { productName, productPrice, additionalContext } = req.body;
      if (!productName) {
        return res.status(400).json({ error: "O nome do produto \xE9 obrigat\xF3rio para realizar a busca comparativa." });
      }
      const prompt = `Voc\xEA \xE9 um Analista de Mercado e Pricing de e-commerce S\xEAnior. 
O cliente possui o seguinte produto em sua planilha:
- Nome do Produto: "${productName}"
- Pre\xE7o Atual do Cliente: R$ ${productPrice || "N\xE3o especificado"}
${additionalContext ? `- Contexto Adicional da Planilha: ${additionalContext}` : ""}

Sua tarefa:
1. Busque na internet em tempo real pelos pre\xE7os atuais deste produto nos principais varejistas brasileiros (como Google Shopping, Mercado Livre, Amazon, Magalu, etc.).
2. Fa\xE7a uma compara\xE7\xE3o direta de pre\xE7os. Calcule a m\xE9dia de mercado e determine se o pre\xE7o do cliente est\xE1 acima ou abaixo da m\xE9dia de mercado (especifique a porcentagem de diferen\xE7a, ex: "Seu pre\xE7o est\xE1 15% acima da m\xE9dia do Google Shopping" ou "Seu pre\xE7o est\xE1 8% abaixo da m\xE9dia de mercado").
3. Forne\xE7a insights brutos, diretos e acion\xE1veis sobre a estrat\xE9gia de precifica\xE7\xE3o recomendada (ex: se devem baixar o pre\xE7o, se h\xE1 margem para aumentar, etc.).
4. Indique de forma clara as fontes, concorrentes e pre\xE7os encontrados.

Responda em portugu\xEAs brasileiro de forma direta, altamente anal\xEDtica e estruturada com marcadores.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_PLANILHAS || "gemini-3.5-flash",
        fallbackModel: "gemini-3.1-flash-lite",
        // fallback if primary experiences transient issues
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      const text = response.text || "N\xE3o foi poss\xEDvel gerar uma compara\xE7\xE3o no momento.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks.map((chunk) => ({
        title: chunk.web?.title || "Fonte externa",
        uri: chunk.web?.uri || "#"
      })).filter((src) => src.uri !== "#");
      res.json({
        productName,
        productPrice,
        insight: text,
        sources,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("Erro no motor de busca comparativa:", err);
      res.status(500).json({ error: err.message || "Erro interno ao executar a busca comparativa." });
    }
  });
  app.get("/api/admin/metrics", requireRole(["Master"]), async (req, res) => {
    try {
      if (!db2) {
        return res.json({
          message: "Modo de simula\xE7\xE3o ativo (Sem banco de dados conectado)",
          totalUsers: 42,
          proUsersCount: 12,
          systemLoad: "Normal"
        });
      }
      const usersSnapshot = await db2.collection("users").get();
      const totalUsers = usersSnapshot.size;
      let proUsersCount = 0;
      usersSnapshot.forEach((doc) => {
        if (doc.data().plan === "pro") proUsersCount++;
      });
      res.json({
        message: "Dados de administra\xE7\xE3o carregados com sucesso.",
        totalUsers,
        proUsersCount,
        currentUserEmail: req.user.email,
        currentUserRole: req.user.role,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("Erro ao carregar m\xE9tricas de admin:", err);
      res.status(500).json({ error: "Erro interno do servidor ao coletar m\xE9tricas." });
    }
  });
  app.get("/api/proxy/sheets-meta", async (req, res) => {
    try {
      const { fileId } = req.query;
      const authHeader = req.headers.authorization;
      if (!fileId) {
        return res.status(400).json({ error: "Par\xE2metro fileId ausente." });
      }
      if (!authHeader) {
        return res.status(401).json({ error: "Token de autoriza\xE7\xE3o do Google ausente." });
      }
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}`, {
        headers: { Authorization: authHeader }
      });
      if (!metaRes.ok) {
        const text = await metaRes.text();
        return res.status(metaRes.status).send(text);
      }
      const data = await metaRes.json();
      res.json(data);
    } catch (err) {
      console.error("Erro no proxy de metadados do Google Sheets:", err);
      res.status(500).json({ error: err.message || "Erro interno no proxy." });
    }
  });
  app.get("/api/proxy/sheets-values", async (req, res) => {
    try {
      const { fileId, range } = req.query;
      const authHeader = req.headers.authorization;
      if (!fileId || !range) {
        return res.status(400).json({ error: "Par\xE2metros fileId ou range ausentes." });
      }
      if (!authHeader) {
        return res.status(401).json({ error: "Token de autoriza\xE7\xE3o do Google ausente." });
      }
      const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: authHeader }
      });
      if (!valRes.ok) {
        const text = await valRes.text();
        return res.status(valRes.status).send(text);
      }
      const data = await valRes.json();
      res.json(data);
    } catch (err) {
      console.error("Erro no proxy de valores do Google Sheets:", err);
      res.status(500).json({ error: err.message || "Erro interno no proxy." });
    }
  });
  app.get("/api/proxy/drive-file-media", async (req, res) => {
    try {
      const { fileId } = req.query;
      const authHeader = req.headers.authorization;
      if (!fileId) {
        return res.status(400).json({ error: "Par\xE2metro fileId ausente." });
      }
      if (!authHeader) {
        return res.status(401).json({ error: "Token de autoriza\xE7\xE3o do Google ausente." });
      }
      const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: authHeader }
      });
      if (!fileRes.ok) {
        const text2 = await fileRes.text();
        return res.status(fileRes.status).send(text2);
      }
      const text = await fileRes.text();
      res.send(text);
    } catch (err) {
      console.error("Erro no proxy de arquivo do Google Drive:", err);
      res.status(500).json({ error: err.message || "Erro interno no proxy." });
    }
  });
  app.post("/api/gemini/insights", async (req, res) => {
    try {
      const { dados, eixoX, eixoY } = req.body;
      if (!dados || !eixoX || !eixoY) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios ausentes para gerar insights." });
      }
      const prompt = `Voc\xEA \xE9 um Analista de Dados s\xEAnior. 
Analise a rela\xE7\xE3o entre o eixo X ("${eixoX}") e o eixo Y ("${eixoY}") com base nos dados agrupados fornecidos.
Forne\xE7a um JSON v\xE1lido com o seguinte formato:
{
  "textoResumo": "Um resumo detalhado em portugu\xEAs com destaques de performance, os maiores valores e pontos cr\xEDticos. Voc\xEA pode usar formata\xE7\xE3o markdown com negrito **texto**.",
  "novasRecomendacoes": ["Recomenda\xE7\xE3o 1", "Recomenda\xE7\xE3o 2", "Recomenda\xE7\xE3o 3", "Recomenda\xE7\xE3o 4"]
}

Dados: ${JSON.stringify(dados)}
Responda EXCLUSIVAMENTE com o JSON v\xE1lido sem bloco de markdown \`\`\`json.`;
      const response = await generateContentWithRetryAndFallback({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      let responseText = response.text || "{}";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Gemini Insights Error:", error);
      res.status(500).json({ error: "Falha ao gerar insights autom\xE1ticos." });
    }
  });
  app.post("/api/analyze-trend", async (req, res) => {
    try {
      const { chartData, xKey, yKey } = req.body;
      if (!chartData || !xKey || !yKey) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios ausentes para previs\xE3o de tend\xEAncia." });
      }
      const prompt = `Aja como um analista de dados. Com base nos seguintes dados hist\xF3ricos para '${xKey}' e '${yKey}', projete os pr\xF3ximos 3 pontos de dados com base na tend\xEAncia.
Dados hist\xF3ricos: ${JSON.stringify(chartData)}
Retorne APENAS um array JSON v\xE1lido contendo 3 objetos com as chaves "${xKey}" e "${yKey}". Certifique-se de que os valores de "${yKey}" sejam num\xE9ricos. N\xE3o inclua nenhuma formata\xE7\xE3o markdown como \`\`\`json.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_PLANILHAS || "gemini-3.5-flash",
        contents: prompt
      });
      let responseText = response.text || "[]";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const projectedData = JSON.parse(responseText);
      const projectedWithFlag = projectedData.map((item) => ({
        ...item,
        isProjection: true
      }));
      res.json({ projectedData: projectedWithFlag });
    } catch (error) {
      console.error("Trend Analysis Error:", error);
      res.status(500).json({ error: "Failed to generate trend analysis." });
    }
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { question, contextData } = req.body;
      if (!question || !contextData) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const systemPrompt = `Voc\xEA \xE9 um Cientista de Dados S\xEAnior e Engenheiro de Analytics especialista em visualiza\xE7\xE3o de dados.
Seu objetivo \xE9 analisar os dados fornecidos pelo usu\xE1rio e responder \xE0 pergunta do chat de forma extremamente \xFAtil.

Se a pergunta do usu\xE1rio solicitar uma compara\xE7\xE3o de subconjuntos, filtragem (ex: "vendas de SP e RJ"), ordena\xE7\xE3o/ranking (ex: "top 5 mais caros", "piores resultados", "maiores valores"), ou agrega\xE7\xE3o de categorias espec\xEDficas, voc\xEA deve:
1. Realizar a filtragem, ordena\xE7\xE3o ou transforma\xE7\xE3o adequada diretamente no conjunto de dados fornecido em 'contextData'.
2. Definir 'isFiltered' como true.
3. Retornar esse subconjunto ou dados transformados no campo 'filteredData' (que deve ser uma lista de objetos JSON representando as linhas selecionadas).
4. Indicar quais colunas devem ser usadas como eixos 'chartXKey' (geralmente textual/categoria) e 'chartYKey' (num\xE9rico/m\xE9trica) para plotar este novo subconjunto de forma perfeita no gr\xE1fico.

Se for uma pergunta gen\xE9rica, te\xF3rica ou resumo geral que n\xE3o requeira focar em uma fatia espec\xEDfica, defina 'isFiltered' como false e retorne o contextData original no 'filteredData'.

O retorno DEVE ser EXCLUSIVAMENTE um objeto JSON v\xE1lido correspondente ao seguinte esquema TypeScript (n\xE3o inclua tags de markdown como \`\`\`json ou texto adicional fora do JSON):
{
  "answer": string, // Resposta detalhada, amig\xE1vel e profissional em portugu\xEAs brasileiro (PT-BR) explicando o insight/resultado encontrado.
  "isFiltered": boolean, // true se houve filtragem/ranking/compara\xE7\xE3o espec\xEDfica e os dados devem atualizar o gr\xE1fico.
  "filteredData": Array<Record<string, any>>, // Lista de objetos contendo as linhas filtradas/transformadas resultantes da an\xE1lise para atualiza\xE7\xE3o do gr\xE1fico.
  "chartXKey": string, // Nome da coluna sugerida para o Eixo X
  "chartYKey": string // Nome da coluna sugerida para o Eixo Y
}

DADOS DO CONJUNTO:
${JSON.stringify(contextData)}

PERGUNTA DO USU\xC1RIO:
${question}

Responda rigorosamente no formato JSON solicitado.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_PLANILHAS || "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const responseText = response.text || "{}";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (err) {
        console.error("Erro ao analisar JSON retornado pelo Gemini:", responseText);
        parsedResponse = {
          answer: responseText.replace(/```json/g, "").replace(/```/g, "").trim(),
          isFiltered: false,
          filteredData: contextData,
          chartXKey: "",
          chartYKey: ""
        };
      }
      res.json(parsedResponse);
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Falha ao gerar resposta do chat." });
    }
  });
  app.post("/api/bi-assistant", async (req, res) => {
    try {
      const { question, columns, sampleRows } = req.body;
      if (!question || !columns) {
        return res.status(400).json({ error: "Missing required fields: question and columns" });
      }
      const systemPrompt = `Voc\xEA \xE9 o assistente inteligente de intelig\xEAncia artificial de um sistema de Business Intelligence avan\xE7ado (similar ao Power BI e Qlik Sense).
Seu objetivo \xE9 analisar o comando ou pergunta do usu\xE1rio em linguagem natural e traduzi-la em uma configura\xE7\xE3o estrita de gr\xE1fico com agrupamento para nosso frontend.

Voc\xEA receber\xE1:
- As colunas dispon\xEDveis na planilha atual: ${JSON.stringify(columns)}
- Uma pequena amostra de linhas dessa planilha (se houver): ${JSON.stringify(sampleRows || [])}

Sua tarefa \xE9 analisar a pergunta e retornar EXCLUSIVAMENTE um objeto JSON v\xE1lido (sem caracteres extras ou marca\xE7\xF5es de bloco de c\xF3digo markdown) que represente as configura\xE7\xF5es ideais para plotar o gr\xE1fico.

Estrutura obrigat\xF3ria do JSON de sa\xEDda:
{
  "eixoX": "NomeExatoDaColunaX", // Deve ser uma das colunas dispon\xEDveis, idealmente categ\xF3rica (texto, data, cidade, produto, vendedor, etc.)
  "eixoY": "NomeExatoDaColunaY", // Deve ser uma das colunas dispon\xEDveis, idealmente num\xE9rica (faturamento, quantidade, pre\xE7o, lucro, etc.)
  "operacao": "Somar" ou "M\xE9dia", // Opera\xE7\xE3o matem\xE1tica de agrega\xE7\xE3o para aplicar nos valores da Coluna Y quando agrupados por Coluna X.
  "tipoGrafico": "Barras" ou "Linhas" ou "\xC1rea" ou "Pizza", // O tipo de gr\xE1fico visual mais adequado para esta representa\xE7\xE3o.
  "filtro": { "coluna": "NomeDaColuna", "valor": "ValorASerFiltrado" } ou null, // Opcional. Se o usu\xE1rio restringiu a an\xE1lise (ex: "s\xF3 em S\xE3o Paulo" ou "do produto celular"), preencha com a coluna e o valor exatos correspondentes. Se n\xE3o houver restri\xE7\xE3o, retorne null.
  "respostaTexto": "Uma mensagem curta, amig\xE1vel e profissional em portugu\xEAs brasileiro explicando o que voc\xEA encontrou ou o gr\xE1fico que acabou de configurar para o usu\xE1rio."
}

Exemplo de mapeamento inteligente:
- Se o usu\xE1rio pedir "faturamento de S\xE3o Paulo", eixoX deve ser a coluna que armazena cidades (ex: "Cidade"), eixoY deve ser "Faturamento", operacao deve ser "Somar", tipoGrafico "Barras", e filtro deve ser { "coluna": "Cidade", "valor": "S\xE3o Paulo" }.
- Se o usu\xE1rio pedir "m\xE9dia de quantidade de eletr\xF4nicos", eixoX deve ser "Produto" ou "Categoria", eixoY deve ser "Quantidade", operacao deve ser "M\xE9dia", tipoGrafico "Barras", filtro { "coluna": "Categoria", "valor": "Eletr\xF4nicos" }.

Retorne APENAS o JSON bruto sem \`\`\`json ou texto ao redor.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_PLANILHAS || "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const responseText = response.text || "{}";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (err) {
        console.error("Erro ao analisar JSON do assistente de BI:", responseText);
        parsedResponse = {
          eixoX: columns[0] || "",
          eixoY: columns[1] || "",
          operacao: "Somar",
          tipoGrafico: "Barras",
          filtro: null,
          respostaTexto: responseText.replace(/```json/g, "").replace(/```/g, "").trim()
        };
      }
      res.json(parsedResponse);
    } catch (error) {
      console.error("BI Assistant Error:", error);
      res.status(500).json({ error: "Falha ao processar comando de voz/texto da IA." });
    }
  });
  app.post("/api/simulate-bot", async (req, res) => {
    try {
      const { niche, channel, voice, goal } = req.body;
      if (!niche || !channel || !voice || !goal) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios ausentes para simula\xE7\xE3o de bot." });
      }
      const prompt = `Voc\xEA \xE9 uma Intelig\xEAncia Artificial configurada como um especialista de Atendimento e Vendas para WhatsApp e Instagram Direct.
Seu objetivo \xE9 gerar um roteiro de fluxo conversacional personalizado baseado nas escolhas do usu\xE1rio.

Par\xE2metros recebidos:
- Nicho da Empresa: "${niche}"
- Canal de Entrada: "${channel}"
- Tom de Voz da IA: "${voice}"
- Objetivo Principal: "${goal}"

Sua tarefa \xE9 retornar obrigatoriamente um objeto JSON com o seguinte formato:
{
  "copyText": "Texto explicativo curto sobre a estrat\xE9gia do Bot (com emojis e formata\xE7\xE3o profissional de WhatsApp em negrito). Use at\xE9 3 frases.",
  "flow": [
    { "step": "1. [Nome do Passo]", "desc": "[Texto simulando o que a IA diria neste passo]" },
    { "step": "2. [Nome do Passo]", "desc": "[Texto simulando o que a IA diria neste passo]" },
    { "step": "3. [Nome do Passo]", "desc": "[Texto simulando o que a IA diria neste passo]" },
    { "step": "4. [Nome do Passo]", "desc": "[Texto simulando o que a IA diria neste passo]" }
  ]
}

Responda em portugu\xEAs brasileiro (PT-BR) exclusivamente com o JSON v\xE1lido. N\xE3o inclua marcas de bloco de c\xF3digo como \`\`\`json ou explica\xE7\xF5es externas.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_WHATSAPP || "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const responseText = response.text || "{}";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
      } catch (err) {
        console.error("Erro ao analisar JSON do assistente de bot:", responseText);
        parsedResponse = {
          copyText: "\u{1F4A1} *Roteiro de Atendimento Inteligente* (Tom: " + voice + ")\n\u2022 Canal: " + channel + "\n\u2022 Foco: " + goal,
          flow: [
            { step: "1. Sauda\xE7\xE3o", desc: "Ol\xE1! Seja muito bem-vindo. Como posso te ajudar hoje?" },
            { step: "2. Qualifica\xE7\xE3o", desc: "Para te dar o atendimento perfeito, qual o seu principal objetivo?" },
            { step: "3. Solu\xE7\xE3o", desc: "Perfeito! Recomendamos nosso plano Pro. Clique no link para assinar." },
            { step: "4. Fechamento", desc: "Perfeito, sua assinatura foi gerada! Qualquer d\xFAvida, estamos aqui." }
          ]
        };
      }
      res.json(parsedResponse);
    } catch (error) {
      console.error("Simulate Bot Error:", error);
      res.status(500).json({ error: "Falha ao simular bot: " + (error.message || error) });
    }
  });
  app.post("/api/simulate-marketing", async (req, res) => {
    try {
      const { product, description, audience, hook } = req.body;
      if (!product || !description || !audience || !hook) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios ausentes para gera\xE7\xE3o de copy de marketing." });
      }
      const prompt = `Voc\xEA \xE9 uma Intelig\xEAncia Artificial configurada como um Copywriter S\xEAnior e Especialista em Marketing Digital.
Seu objetivo \xE9 gerar uma copy altamente persuasiva e uma ideia de criativo/design para an\xFAncios de tr\xE1fego pago (Facebook/Google Ads).

Par\xE2metros recebidos:
- Nome do Produto: "${product}"
- O que o Produto faz (Descri\xE7\xE3o): "${description}"
- P\xFAblico-Alvo: "${audience}"
- F\xF3rmula / Gancho de Copywriting: "${hook}"

Sua tarefa \xE9 retornar obrigatoriamente um objeto JSON com o seguinte formato:
{
  "headline": "Uma headline matadora e chamativa para o an\xFAncio",
  "primaryText": "O texto principal do an\xFAncio estruturado seguindo rigorosamente a f\xF3rmula escolhida (${hook}). Use quebras de linha e emojis de forma profissional.",
  "description": "Uma descri\xE7\xE3o curta para o rodap\xE9 do an\xFAncio",
  "cta": "O texto do bot\xE3o de chamada para a\xE7\xE3o (ex: Saiba Mais, Quero Garantir)",
  "imageSuggestion": "Uma sugest\xE3o detalhada e criativa de imagem ou v\xEDdeo que o designer deve criar para acompanhar esta copy"
}

Responda em portugu\xEAs brasileiro (PT-BR) exclusivamente com o JSON v\xE1lido. N\xE3o inclua marcas de bloco de c\xF3digo como \`\`\`json ou explica\xE7\xF5es externas.`;
      const response = await generateContentWithRetryAndFallback({
        model: process.env.ID_BOT_MARKETING || "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const responseText = response.text || "{}";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
      } catch (err) {
        console.error("Erro ao analisar JSON do assistente de marketing:", responseText);
        parsedResponse = {
          headline: `\u{1F525} Aten\xE7\xE3o: Transforme sua empresa com ${product}!`,
          primaryText: `Voc\xEA quer resolver seus problemas hoje?

[PROBLEMA] Ficar preso em processos manuais consome tempo e dinheiro.
[AGITA\xC7\xC3O] Enquanto isso, seus concorrentes usam intelig\xEAncia artificial.
[SOLU\xC7\xC3O] Descubra o poder de ${product}: ${description}.`,
          description: `Garanta agora o seu acesso!`,
          cta: `Saiba Mais`,
          imageSuggestion: `Imagem minimalista e futurista contrastando tons escuros com neon ciano.`
        };
      }
      res.json(parsedResponse);
    } catch (error) {
      console.error("Simulate Marketing Error:", error);
      res.status(500).json({ error: "Falha ao gerar copy de marketing: " + (error.message || error) });
    }
  });
  app.post("/api/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "O tamanho do arquivo excede o limite m\xE1ximo permitido de 10MB." });
        }
        return res.status(400).json({ error: err.message || "Falha no upload do arquivo." });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }
      const authHeader = req.headers.authorization;
      let uid = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.split("Bearer ")[1];
        if ((0, import_app2.getApps)().length) {
          try {
            const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
            uid = decodedToken.uid;
          } catch (tokenErr) {
            console.error("Erro ao verificar token no upload:", tokenErr);
          }
        }
      }
      let newQuotaUsed = 0;
      if (uid && db2) {
        const userRef = db2.collection("users").doc(uid);
        const userDoc = await userRef.get();
        let currentQuota = 0;
        let plan = "free";
        if (userDoc.exists) {
          const userData = userDoc.data();
          currentQuota = userData?.quotaUsed || 0;
          plan = userData?.plan || "free";
        }
        if (plan === "free" && currentQuota >= 5) {
          return res.status(403).json({ error: "Voc\xEA atingiu o limite de 5 relat\xF3rios do plano gratuito. Fa\xE7a upgrade para o PRO." });
        }
        newQuotaUsed = currentQuota + 1;
        await userRef.set({ quotaUsed: newQuotaUsed }, { merge: true });
      }
      const originalName = req.file.originalname || "";
      const isExcel = originalName.endsWith(".xlsx") || originalName.endsWith(".xls");
      let rawHeaders = [];
      let rawData = [];
      if (isExcel) {
        try {
          const workbook = import_xlsx.default.read(req.file.buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            return res.status(400).json({ error: "O arquivo Excel n\xE3o possui planilhas." });
          }
          const worksheet = workbook.Sheets[sheetName];
          const sheetJson = import_xlsx.default.utils.sheet_to_json(worksheet);
          if (!sheetJson.length) {
            return res.status(400).json({ error: "A planilha selecionada est\xE1 vazia." });
          }
          rawData = sheetJson;
          rawHeaders = Object.keys(sheetJson[0] || {});
        } catch (excelErr) {
          console.error("Excel parse error:", excelErr);
          return res.status(400).json({ error: "Falha ao processar o arquivo Excel: " + excelErr.message });
        }
      } else {
        const fileContent = req.file.buffer.toString("utf-8");
        const results = import_papaparse.default.parse(fileContent, {
          header: true,
          dynamicTyping: true,
          // Automatically converts standard numbers/booleans
          skipEmptyLines: true
        });
        if (results.errors.length && !results.data.length) {
          return res.status(400).json({ error: "Falha ao processar o arquivo CSV", details: results.errors });
        }
        rawData = results.data;
        if (!rawData.length) {
          return res.status(400).json({ error: "O arquivo CSV est\xE1 vazio." });
        }
        rawHeaders = results.meta.fields || Object.keys(rawData[0] || {});
      }
      const headers = rawHeaders.map((h) => h.trim().replace(/^["']|["']$/g, ""));
      let data = rawData.map((row) => {
        const cleanedRow = {};
        Object.entries(row).forEach(([key, val]) => {
          const cleanedKey = key.trim().replace(/^["']|["']$/g, "");
          let cleanedVal = val;
          if (typeof val === "string") {
            cleanedVal = val.trim().replace(/^["']|["']$/g, "");
          }
          cleanedRow[cleanedKey] = cleanedVal;
        });
        return cleanedRow;
      });
      const columnTypes = {};
      headers.forEach((header) => {
        const sampleValues = data.map((row) => row[header]).filter((v) => v !== null && v !== void 0 && v !== "");
        if (sampleValues.length === 0) {
          columnTypes[header] = "unknown";
          return;
        }
        let numericCount = 0;
        sampleValues.forEach((val) => {
          if (tryParseNumber(val) !== null) {
            numericCount++;
          }
        });
        const isNumericColumn = numericCount / sampleValues.length >= 0.6;
        if (isNumericColumn) {
          columnTypes[header] = "number";
          data.forEach((row) => {
            const rawVal = row[header];
            if (rawVal !== null && rawVal !== void 0 && rawVal !== "") {
              const num = tryParseNumber(rawVal);
              row[header] = num !== null ? num : 0;
            } else {
              row[header] = null;
            }
          });
        } else {
          let booleanCount = 0;
          sampleValues.forEach((val) => {
            const s = String(val).toLowerCase().trim();
            if (typeof val === "boolean" || s === "true" || s === "false" || s === "sim" || s === "n\xE3o" || s === "nao") {
              booleanCount++;
            }
          });
          if (booleanCount / sampleValues.length >= 0.6) {
            columnTypes[header] = "boolean";
            data.forEach((row) => {
              const rawVal = row[header];
              if (rawVal === null || rawVal === void 0 || rawVal === "") {
                row[header] = null;
              } else {
                const s = String(rawVal).toLowerCase().trim();
                row[header] = s === "true" || s === "sim" || rawVal === true;
              }
            });
          } else {
            let dateCount = 0;
            sampleValues.forEach((val) => {
              const strVal = String(val).trim();
              const dateParse = Date.parse(strVal);
              const isDateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}-\d{2}-\d{4}/.test(strVal);
              if (!isNaN(dateParse) && isDateRegex) {
                dateCount++;
              }
            });
            if (dateCount / sampleValues.length >= 0.5) {
              columnTypes[header] = "date";
            } else {
              columnTypes[header] = "string";
            }
          }
        }
      });
      const hasMetric = Object.values(columnTypes).includes("number");
      const hasDimension = Object.values(columnTypes).includes("string") || Object.values(columnTypes).includes("date");
      if (!hasMetric || !hasDimension) {
        return res.status(400).json({
          error: "Valida\xE7\xE3o falhou. O arquivo deve conter pelo menos uma coluna de texto/data (dimens\xE3o) e uma coluna num\xE9rica (m\xE9trica) para gerarmos gr\xE1ficos."
        });
      }
      let insight = "Os insights aparecer\xE3o aqui.";
      try {
        const dataSample = data.slice(0, 3);
        const prompt = `Aja como um analista de dados s\xEAnior. Voc\xEA recebeu um conjunto de dados com as seguintes colunas e tipos: ${JSON.stringify(columnTypes)}. 
Aqui est\xE3o as primeiras 3 linhas: ${JSON.stringify(dataSample)}. 
Escreva um resumo curto e engajador de exatamente 2 frases (em portugu\xEAs brasileiro, PT-BR) sobre o que esses dados parecem tratar e que tipo de insights podem ser extra\xEDdos. Seja profissional.`;
        const response = await generateContentWithRetryAndFallback({
          model: process.env.ID_BOT_PLANILHAS || "gemini-3.5-flash",
          contents: prompt
        });
        insight = response.text || insight;
      } catch (aiError) {
        console.error("AI Insight Error:", aiError);
        insight = "N\xE3o foi poss\xEDvel gerar os insights da IA no momento devido a um erro.";
      }
      return res.json({
        headers,
        columnTypes,
        totalRows: data.length,
        sampleData: data.slice(0, 50),
        insight,
        quotaUsed: newQuotaUsed > 0 ? newQuotaUsed : void 0
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor ao processar a planilha." });
    }
  });
  const CHATBOT_API_URL = process.env.CHATBOT_API_URL || "https://chatbot-v2-240342026700.us-central1.run.app";
  app.get("/api/whatsapp/session", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/session`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      res.json({ status: "DISCONNECTED", qrCode: null, connectedAt: null, phoneNumber: null, chats: {} });
    } catch (err) {
      res.json({ status: "DISCONNECTED", qrCode: null, connectedAt: null, phoneNumber: null, chats: {} });
    }
  });
  app.get("/get-qr", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/session`);
      if (response.ok) {
        const data = await response.json();
        return res.json({
          qr: data.qrCode || data.qr,
          qrCode: data.qrCode || data.qr,
          status: data.status
        });
      }
      res.json({ qr: null, qrCode: null, status: "DISCONNECTED" });
    } catch (err) {
      res.json({ qr: null, qrCode: null, status: "DISCONNECTED" });
    }
  });
  app.post("/api/whatsapp/connect", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message || "Erro de conex\xE3o com o servi\xE7o de chatbot." });
    }
  });
  app.post("/api/whatsapp/simulate-scan", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/simulate-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message || "Erro de simula\xE7\xE3o no servi\xE7o de chatbot." });
    }
  });
  app.post("/api/whatsapp/disconnect", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/disconnect`, {
        method: "POST"
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message || "Erro ao desconectar no servi\xE7o de chatbot." });
    }
  });
  app.post("/api/whatsapp/webhook-simulate", async (req, res) => {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/whatsapp/webhook-simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      try {
        const { message, botConfig } = req.body;
        const bot = botConfig || {
          name: "Vendas WhatsApp - E-commerce",
          niche: "E-commerce",
          voice: "Persuasivo",
          goal: "Recupera\xE7\xE3o de carrinho abandonado e convers\xE3o de Pix",
          instructions: "Voc\xEA \xE9 um assistente de vendas da loja Foco em Dados."
        };
        const systemPrompt = `Voc\xEA \xE9 um Rob\xF4 de Atendimento com IA. Nova mensagem do cliente: "${message}". Responda de forma persuasiva para cumprir: ${bot.goal}`;
        const responseAI = await generateContentWithRetryAndFallback({
          model: "gemini-3.5-flash",
          contents: systemPrompt
        });
        return res.json({
          success: true,
          reply: responseAI.text || "Entendido! Estou processando seu atendimento.",
          history: [],
          session: { status: "CONNECTED" }
        });
      } catch (innerErr) {
        res.status(500).json({ error: innerErr.message || "Erro ao processar simula\xE7\xE3o." });
      }
    }
  });
  app.get("/", (req, res, next) => {
    if (req.headers.accept && req.headers.accept.includes("application/json") || req.query.json === "true") {
      return res.json({ status: "online", bot: "aguardando_conexao" });
    }
    next();
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
