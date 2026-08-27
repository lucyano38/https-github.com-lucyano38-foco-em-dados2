import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type {
  ActivityLog, AnalysisReport, ReportChart, ReportTable, UploadedFile,
} from './types';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Check,
  Sparkles,
  Presentation,
  Database,
  Volume2,
  VolumeX,
  MessageSquare,
  Kanban,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Users,
  Search,
} from 'lucide-react';
import { CrmDashboard } from './components/CrmDashboard';
import { SlideDeckModal } from './components/SlideDeckModal';
import { GeminiChatSidebar } from './components/GeminiChatSidebar';
import { OpenSquadView } from './components/OpenSquadView';
import { Landing } from './components/Landing';
import { EvoluaDemoDashboard } from './components/EvoluaDemoDashboard';
import { ClientProspectingView } from './components/ClientProspectingView';
import { AutomatedIndicatorsView } from './components/AutomatedIndicatorsView';
import { CookieBanner } from './components/CookieBanner';



const UPLOAD_EXAMPLES = [
  'Summarize the key trends and the most important drivers in this data.',
  'What are the top segments by value, and how do they differ?',
  'Are there any anomalies or outliers I should investigate?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status?: Status;
  logs?: ActivityLog[];
  report?: AnalysisReport | null;
  stage?: string;
  question?: string;
}

type Status = 'idle' | 'uploading' | 'running' | 'done' | 'error';

const nowStamp = () => new Date().toISOString().split('T')[1].split('.')[0];

function createUploadSessionId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, delayMs);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException('The request was cancelled.', 'AbortError'));
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

function stageFromCommand(cmd: string): string | null {
  if (/curl|wget|gsutil|storage\.googleapis/.test(cmd)) return 'Loading dataset...';
  if (/profil(e|ing)|profile\.json/.test(cmd)) return 'Profiling tables...';
  if (cmd.includes('make_chart.py')) return 'Rendering charts...';
  if (cmd.includes('build_report.py')) return 'Compiling report...';
  if (/sklearn|RandomForest|KMeans|LinearRegression|LogisticRegression/.test(cmd)) return 'Modeling...';
  if (/groupby|merge|pivot|pd\.|pandas|resample/.test(cmd)) return 'Analyzing...';
  if (cmd.includes('pip install')) return 'Setting up environment...';
  return null;
}

function sanitizeAgentText(text: string): string {
  if (!text) return text;
  let sanitized = text;
  // Remove hallucinated tool calls like "call:default_api:bash{...}" or other "call:default_api:" blocks
  sanitized = sanitized.replace(/call:default_api:[a-zA-Z0-9_!:#-]+(?:\s*\{[\s\S]*?\})?/g, "");
  sanitized = sanitized.replace(/call:default_api:[^\s]+/g, "");
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
  return sanitized.trim();
}

const FormattedMarkdown: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
  const cleaned = sanitizeAgentText(content);
  return (
    <div className={`prose prose-invert prose-sm max-w-none text-[#e3e2e2] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 leading-relaxed text-[#e3e2e2]">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-base font-bold font-['Hanken_Grotesk'] mt-3 mb-1.5 text-[#ffe4af] border-b border-[#4f4632]/40 pb-1">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-sm font-bold font-['Hanken_Grotesk'] mt-2.5 mb-1 text-[#ffe4af]">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xs font-bold font-['Hanken_Grotesk'] mt-2 mb-1 text-[#ffe4af] uppercase tracking-wide">{children}</h3>;
          },
          strong({ children }) {
            return <strong className="font-semibold text-[#ffe4af]">{children}</strong>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-[#e3e2e2]">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-4 my-2 space-y-1 text-[#e3e2e2]">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed pl-0.5">{children}</li>;
          },
          code({ node, inline, className: codeClassName, children, ...props }: any) {
            const isInline = inline || !String(children).includes('\n');
            if (isInline) {
              return (
                <code className="bg-[#121414] font-mono text-[12px] px-1.5 py-0.5 rounded text-[#ffe4af] font-medium border border-[#4f4632]/60" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#121414] text-[#ffe4af] p-3 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto my-2.5 border border-[#4f4632]/50">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-[#4f4632]/50 shadow-2xs bg-[#1e2020]">
                <table className="w-full text-xs text-left border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-[#121414] text-[#ffe4af] font-semibold border-b border-[#4f4632]/50">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-[#4f4632]/30 bg-[#1e2020]">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-black/30 transition">{children}</tr>;
          },
          th({ children }) {
            return <th className="p-2.5 font-semibold text-[#ffe4af]">{children}</th>;
          },
          td({ children }) {
            return <td className="p-2.5 text-[#e3e2e2]">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-[#ffc107] bg-[#121414]/80 px-3 py-2 text-[#d4c5ab] italic my-2 rounded-r-lg text-xs">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#ffe4af] font-medium underline hover:text-amber-300">
                {children}
              </a>
            );
          }
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
};

function environmentIdFromInteraction(interaction: any): string | null {
  if (!interaction || typeof interaction !== 'object') return null;
  const environment = interaction.environment;
  const candidates = [
    environment?.env_id,
    environment?.environment_id,
    environment?.id,
    environment?.name,
    interaction.environment_id,
    interaction.env_id,
  ];
  const value = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  if (typeof value !== 'string') return null;
  return value.replace(/^environments?\//, '').replace(/^environment-/, '');
}

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [ecosystemMode, setEcosystemMode] = useState<'analytics' | 'crm' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators'>('analytics');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [appLeads, setAppLeads] = useState<any[]>([]);

  // Fetch leads for OpenSquad and CRM sync
  const fetchAppLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAppLeads(data);
        }
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchAppLeads();
  }, [ecosystemMode]);
  const [question, setQuestion] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [stage, setStage] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Gemini AI Smart Tools State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [uploadSessionId, setUploadSessionId] = useState(createUploadSessionId);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [viewedMessageId, setViewedMessageId] = useState<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef<string | null>(null);

  const datasetName = files.length === 1
      ? files[0].name.replace(/\.(csv|xlsx|xls|json|tsv)$/i, '')
      : files.length > 1
        ? `${files.length} datasets`
        : 'Dataset';

  const examples = UPLOAD_EXAMPLES;
  const canRun = status !== 'running' && question.trim() !== '' && files.length > 0;

  // Toggle Executive Audio Briefing (Native Brazilian Portuguese TTS)
  const toggleAudioSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Seu navegador não possui suporte a síntese de voz (TTS).');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Suggest Business Questions using Gemini
  const fetchSuggestedQuestions = async () => {
    if (files.length === 0 || loadingSuggestions) return;
    try {
      setLoadingSuggestions(true);
      const firstFile = files[0];
      const res = await fetch('/api/suggest-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName,
          sampleData: (firstFile?.content || ''),
        }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        setSuggestedQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Auto-fetch suggested questions when files are loaded
  useEffect(() => {
    if (files.length > 0 && suggestedQuestions.length === 0) {
      fetchSuggestedQuestions();
    }
  }, [files]);

  // Handler to receive CRM lead data in Data Analyst
  const handleSendCrmToAnalyst = (csvContent: string, datasetTitle: string) => {
    const crmFile: UploadedFile = {
      name: `${datasetTitle.toLowerCase().replace(/\s+/g, '_')}.csv`,
      content: csvContent,
      size: csvContent.length,
      isLocal: true,
    };
    setFiles([crmFile]);
    setQuestion('Faça um diagnóstico completo do funil de vendas, calcule a taxa de conversão por nicho e a projeção de MRR e LTV anual.');
    setEcosystemMode('analytics');
  };

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const validFiles = Array.from(fileList).filter((f) =>
      /\.(csv|xlsx|xls|json|tsv)$/i.test(f.name)
    );
    if (validFiles.length === 0) return;

    const MAX_INLINE_SIZE = 15 * 1024 * 1024; // 15MB limit for inline analysis
    const oversizedFiles = validFiles.filter((f) => f.size > MAX_INLINE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrorMsg(`Tamanho excede o limite de 15MB: ${oversizedFiles.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`).join(', ')}.`);
      setStatus('error');
      return;
    }

    setStatus('uploading');
    try {
      const uploaded = await Promise.all(
        validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('sessionId', uploadSessionId);

          const maxAttempts = 5;
          const retryDelayMs = 2000;
          let res: Response | null = null;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
              redirect: 'manual',
            });

            const wasRedirected =
              res.type === 'opaqueredirect' ||
              res.redirected ||
              (res.status >= 300 && res.status < 400);

            if (!wasRedirected) break;
            if (attempt === maxAttempts) {
              throw new Error('The upload service kept redirecting the request. Please try again.');
            }

            await new Promise(resolve => window.setTimeout(resolve, retryDelayMs));
          }

          if (!res) {
            throw new Error('The upload service did not return a response.');
          }

          const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
          if (!res.ok) {
            let backendErr = "";
            if (contentType.includes('application/json')) {
              const errData = await res.json().catch(() => ({}));
              if (errData.error) {
                try {
                   const parsed = JSON.parse(errData.error);
                   if (parsed.error && parsed.error.message) {
                     backendErr = parsed.error.message;
                   }
                } catch {
                   backendErr = errData.error;
                }
              }
            }
            throw new Error(backendErr || `Failed to upload ${file.name}`);
          }

          if (!contentType.includes('application/json')) {
            throw new Error('The upload service returned an unexpected response.');
          }

          const data = await res.json();
          return {
            name: file.name,
            content: data.content,
            size: file.size,
            gsUri: data.gsUri,
            localPath: data.localPath,
            isLocal: data.isLocal
          } as UploadedFile;
        })
      );
      setFiles((prev) => {
        const byName = new Map(prev.map((f) => [f.name, f]));
        for (const f of uploaded) byName.set(f.name, f);
        return Array.from(byName.values());
      });
      setStatus('idle');
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading files');
      setStatus('error');
    }
  }, [uploadSessionId]);

  const addGcsUriFile = useCallback((uri: string) => {
    const trimmed = uri.trim();
    if (!trimmed.startsWith('gs://')) {
      setErrorMsg('GCS URI must start with gs:// (e.g. gs://bucket-name/large_dataset.csv)');
      setStatus('error');
      return;
    }
    const filename = trimmed.split('/').pop() || 'dataset.csv';
    const name = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
    const gcsFile: UploadedFile = {
      name,
      gsUri: trimmed,
      isGcsUri: true
    };
    setFiles((prev) => {
      const byName = new Map(prev.map((f) => [f.name, f]));
      byName.set(gcsFile.name, gcsFile);
      return Array.from(byName.values());
    });
    setErrorMsg(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const pushLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const fullLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).slice(2),
      timestamp: nowStamp(),
    };
    setLogs((prev) => [...prev, fullLog]);

    setChatMessages((prevChat) => {
      const idx = prevChat.findIndex((m) => m.id === activeMessageIdRef.current);
      if (idx !== -1) {
        const nextChat = [...prevChat];
        const msg = nextChat[idx];
        const nextLogs = [...(msg.logs || []), fullLog];
        nextChat[idx] = { ...msg, logs: nextLogs, stage: log.content || msg.stage };
        return nextChat;
      }
      return prevChat;
    });
  };

  const appendStreamingText = (type: 'thinking' | 'text', chunk: string) => {
    setLogs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.type === type) {
        const prevContent = last.content ?? '';
        if (chunk === prevContent) return prev;
        const merged = chunk.startsWith(prevContent) ? chunk : prevContent + chunk;
        const copy = [...prev];
        copy[copy.length - 1] = { ...last, content: merged, timestamp: nowStamp() };
        return copy;
      }
      return [...prev, { id: Math.random().toString(36).slice(2), timestamp: nowStamp(), type, content: chunk }];
    });

    setChatMessages((prevChat) => {
      const idx = prevChat.findIndex((m) => m.id === activeMessageIdRef.current);
      if (idx !== -1) {
        const nextChat = [...prevChat];
        const msg = nextChat[idx];
        const nextLogs = [...(msg.logs || [])];

        if (nextLogs.length > 0 && nextLogs[nextLogs.length - 1].type === type) {
          const lastLog = nextLogs[nextLogs.length - 1];
          const prevContent = lastLog.content ?? '';
          const merged = chunk.startsWith(prevContent) ? chunk : prevContent + chunk;
          nextLogs[nextLogs.length - 1] = { ...lastLog, content: merged, timestamp: nowStamp() };
        } else {
          nextLogs.push({
            id: Math.random().toString(36).slice(2),
            timestamp: nowStamp(),
            type,
            content: chunk,
          });
        }

        let nextText = msg.text || '';
        if (type === 'text') {
          nextText += chunk;
        }

        nextChat[idx] = { ...msg, text: nextText, logs: nextLogs };
        return nextChat;
      }
      return prevChat;
    });
  };

  const stop = async () => {
    abortRef.current?.abort();
    if (generationIdRef.current) {
      try {
        await fetch('/api/cancel-show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generationId: generationIdRef.current }),
        });
      } catch {
        /* ignore */
      }
    }
    setStatus('idle');
    setStage('');
  };

  const runAnalysis = async (followUpTextArg?: unknown) => {
    const followUpText = typeof followUpTextArg === 'string' ? followUpTextArg : undefined;
    if (followUpText && status === 'running') return; // Prevent multiple concurrent runs
    if (!followUpText && !canRun) return;
    if (followUpText && !environmentId) {
      setErrorMsg('This analysis session is no longer available. Start a new analysis and upload the dataset again.');
      return;
    }

    setStatus('running');
    setStage('Initializing...');
    setErrorMsg(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const generationId = Math.random().toString(36).slice(2);
    generationIdRef.current = generationId;

    const isFollowUp = !!followUpText && !!environmentId;
    const questionText = followUpText ? followUpText.trim() : question.trim();

    // Prepare message IDs
    const userMsgId = `user-${Math.random().toString(36).slice(2)}`;
    const assistantMsgId = `assistant-${Math.random().toString(36).slice(2)}`;
    activeMessageIdRef.current = assistantMsgId;

    // Build user and assistant message objects
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: questionText,
    };
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      status: 'running',
      logs: [],
      stage: 'Initializing...',
      question: questionText,
    };

    if (followUpText) {
      setChatMessages((prev) => [...prev, userMsg, assistantMsg]);
    } else {
      setLogs([]);
      setReport(null);
      setChatMessages([userMsg, assistantMsg]);
    }
    setViewedMessageId(assistantMsgId);

    const payload: Record<string, unknown> = {
      question: questionText,
      datasetName,
      generationId,
      environmentId: isFollowUp ? environmentId : undefined,
    };

    if (!isFollowUp) {
      payload.files = files;
    }

    try {
      const maxAttempts = 5;
      const retryDelayMs = 2000;
      let response: Response | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
          redirect: 'manual',
        });

        const wasRedirected =
          response.type === 'opaqueredirect' ||
          response.redirected ||
          (response.status >= 300 && response.status < 400);

        if (!wasRedirected) break;
        if (attempt === maxAttempts) {
          throw new Error('The analysis service kept redirecting the request. Please try again.');
        }

        setStage(`Analysis service is not ready. Retrying in ${retryDelayMs / 1000} seconds...`);
        await waitForRetry(retryDelayMs, controller.signal);
      }

      if (!response) {
        throw new Error('The analysis service did not return a response.');
      }

      if (response.status === 429) {
        const err = await response.json().catch(() => ({}));
        setErrorMsg(err.error || 'Rate limit or quota exceeded. Please try again in a few moments.');
        setStatus('error');
        setChatMessages((prevChat) => {
          const idx = prevChat.findIndex((m) => m.id === assistantMsgId);
          if (idx !== -1) {
            const nextChat = [...prevChat];
            nextChat[idx] = { ...nextChat[idx], status: 'error', text: 'Rate limit or quota exceeded. Please try again shortly.' };
            return nextChat;
          }
          return prevChat;
        });
        return;
      }
      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${response.status})`);
      }
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
      if (!contentType.includes('text/event-stream')) {
        throw new Error('The analysis service returned an unexpected response instead of an event stream.');
      }

      if (isFollowUp) {
        setLogs([]);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedReport = false;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;

          let event: any;
          try {
            event = JSON.parse(dataStr);
          } catch (err) {
            console.error(`Failed to parse SSE frame (len ${dataStr.length}):`, dataStr.slice(0, 200), err);
            streamError = streamError || 'The connection dropped or message was truncated mid-report.';
            break;
          }

          switch (event.type) {
            case 'info':
              if (event.message) setStage(event.message);
              pushLog({ type: 'info', content: event.message });
              break;
            case 'thinking':
            case 'text':
              if (typeof event.text === 'string' && event.text) {
                appendStreamingText(event.type, event.text);
              }
              break;
            case 'tool_call': {
              const cmd = String(event.arguments?.command ?? event.arguments?.code ?? '');
              const s = stageFromCommand(cmd);
              if (s) setStage(s);
              pushLog({ type: 'tool_call', name: event.name, args: event.arguments });
              break;
            }
            case 'tool_result': {
              let result = String(event.result ?? '');
              if (result.length > 3000) result = result.slice(0, 3000) + '…';
              pushLog({ type: 'tool_result', name: event.name, result });
              break;
            }
            case 'report_data':
              if (event.data) {
                receivedReport = true;
                const reportData = event.data as AnalysisReport;
                setReport(reportData);
                setChatMessages((prevChat) => {
                  const idx = prevChat.findIndex((m) => m.id === assistantMsgId);
                  if (idx !== -1) {
                    const nextChat = [...prevChat];
                    nextChat[idx] = { ...nextChat[idx], report: reportData };
                    return nextChat;
                  }
                  return prevChat;
                });
              }
              break;
            case 'interaction':
            case 'complete':
              if (event.interaction) {
                const envId = environmentIdFromInteraction(event.interaction);
                if (envId) setEnvironmentId(envId);
              }
              break;
            case 'session':
              if (typeof event.environmentId === 'string' && event.environmentId) {
                setEnvironmentId(event.environmentId);
              }
              break;
            case 'error':
              streamError = event.message || 'The analysis failed.';
              setErrorMsg(streamError);
              setStatus('error');
              pushLog({ type: 'error', content: streamError });
              break;
            default:
              break;
          }
        }
        if (streamError) break;
      }

      if (!streamError && buffer.trim().startsWith('data: ')) {
        const dataStr = buffer.trim().slice(6);
        if (dataStr && dataStr !== '[DONE]') {
          console.error(`Incomplete SSE frame in buffer at stream end (len ${dataStr.length}):`, dataStr.slice(0, 200));
          streamError = 'The connection dropped or message was truncated mid-report.';
        }
      }

      setStage('');

      if (streamError || !receivedReport) {
        const finalError = streamError || 'The analysis stream ended before a dashboard report was produced.';
        setErrorMsg(finalError);
        setStatus('error');
        setChatMessages((prevChat) => {
          const idx = prevChat.findIndex((m) => m.id === assistantMsgId);
          if (idx !== -1) {
            const nextChat = [...prevChat];
            nextChat[idx] = {
              ...nextChat[idx],
              status: 'error',
              text: nextChat[idx].text || finalError,
            };
            return nextChat;
          }
          return prevChat;
        });
        return;
      }

      setStatus('done');
      setChatMessages((prevChat) => {
        const idx = prevChat.findIndex((m) => m.id === assistantMsgId);
        if (idx !== -1) {
          const nextChat = [...prevChat];
          nextChat[idx] = { ...nextChat[idx], status: 'done' };
          return nextChat;
        }
        return prevChat;
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setErrorMsg(e?.message || 'Unexpected error');
      setStatus('error');
      setChatMessages((prevChat) => {
        const idx = prevChat.findIndex((m) => m.id === assistantMsgId);
        if (idx !== -1) {
          const nextChat = [...prevChat];
          nextChat[idx] = { ...nextChat[idx], status: 'error', text: (nextChat[idx].text || '') + `\n\nError: ${e?.message || 'Unexpected error'}` };
          return nextChat;
        }
        return prevChat;
      });
    } finally {
      generationIdRef.current = null;
    }
  };

  const selectMessage = (msgId: string) => {
    const msg = chatMessages.find((m) => m.id === msgId);
    if (msg && msg.role === 'assistant') {
      setViewedMessageId(msgId);
      if (msg.report) {
        setReport(msg.report);
      }
      if (msg.logs) {
        setLogs(msg.logs);
      }
    }
  };

  const reset = () => {
    const sessionIdToClear = uploadSessionId;
    setStatus('idle');
    setReport(null);
    setLogs([]);
    setErrorMsg(null);
    setStage('');
    setEnvironmentId(null);
    setChatMessages([]);
    setViewedMessageId(null);
    activeMessageIdRef.current = null;
    setFiles([]); // Clear client-side uploaded files state
    setUploadSessionId(createUploadSessionId());

    // Delete only the GCS files belonging to the analysis being reset.
    fetch('/api/clear-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionIdToClear }),
    }).catch((err) => {
      console.error('Failed to clear uploaded files:', err);
    });
  };

  if (showLanding) {
    return (
      <Landing
        onStart={(mode) => {
          setEcosystemMode(mode);
          setShowLanding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#121414] text-[#e3e2e2] font-sans flex flex-col pb-12">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-[#4f4632]/40 shadow-[0_0_20px_rgba(250,189,0,0.1)]">
        <div className="flex justify-between items-center px-4 md:px-16 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLanding(true)}
              className="font-['Hanken_Grotesk'] text-xl md:text-2xl text-[#ffe4af] font-bold tracking-tight hover:underline cursor-pointer"
              title="Voltar para a página inicial"
            >
              Foco Completo
            </button>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Evolua Pro
            </span>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 bg-[#1e2020]/90 rounded-2xl border border-[#4f4632]/50 shadow-inner flex-wrap gap-1">
            <button
              onClick={() => setEcosystemMode('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                ecosystemMode === 'analytics'
                  ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
                  : 'text-[#d4c5ab] hover:text-[#ffe4af]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              AI Data Analyst
            </button>
            <button
              onClick={() => setEcosystemMode('prospecting')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                ecosystemMode === 'prospecting'
                  ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
                  : 'text-[#d4c5ab] hover:text-[#ffe4af]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Prospecção
            </button>
            <button
              onClick={() => setEcosystemMode('crm')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                ecosystemMode === 'crm'
                  ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
                  : 'text-[#d4c5ab] hover:text-[#ffe4af]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              CRM Kanban
            </button>
            <button
              onClick={() => setEcosystemMode('indicators')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                ecosystemMode === 'indicators'
                  ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
                  : 'text-[#d4c5ab] hover:text-[#ffe4af]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Indicadores
            </button>
            <button
              onClick={() => setEcosystemMode('opensquad')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                ecosystemMode === 'opensquad'
                  ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
                  : 'text-[#d4c5ab] hover:text-[#ffe4af]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              OpenSquad
            </button>
          </div>

          <div className="flex items-center gap-3">
            {report && ecosystemMode === 'analytics' && (
              <>
                <button
                  onClick={() => setIsSlideDeckOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ffc107] hover:bg-[#fabd00] text-[#3f2e00] rounded-full text-xs font-bold shadow-[0_0_15px_rgba(250,189,0,0.3)] transition cursor-pointer"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  Slides Executivos
                </button>
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e2020] text-[#ffe4af] hover:bg-[#292a2a] rounded-full text-xs font-semibold border border-[#4f4632]/50 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat Gemini
                </button>
              </>
            )}
            {!report && ecosystemMode === 'analytics' && (
              <button
                onClick={() => {
                  const demoCsv = `slug,nome,nicho,cidade,status,valor,manutencao,contratoStatus\nclinica-odonto-alphaville,Clínica Odonto Prime,Odontologia,Barueri / SP,fechado,1200,190,assinado\nescritorio-advocacia,Martins Advocacia,Direito,São Paulo / SP,proposta,1500,250,enviado`;
                  const demoFile: UploadedFile = { name: 'foco_completo_leads_demo.csv', content: demoCsv, size: demoCsv.length };
                  setFiles([demoFile]);
                  setQuestion('Faça uma análise executiva dos leads e projete o crescimento de MRR.');
                }}
                className="bg-[#ffc107] text-[#3f2e00] px-5 py-2 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(250,189,0,0.3)] hover:scale-105 transition cursor-pointer"
              >
                Carregar Demonstração
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>

      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* RENDER MODES */}
      {ecosystemMode === 'evolua_demo' ? (
        <EvoluaDemoDashboard
          onBackToLanding={() => setShowLanding(true)}
          onOpenAppMode={(mode) => setEcosystemMode(mode)}
        />
      ) : ecosystemMode === 'prospecting' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col min-h-[750px]">
          <ClientProspectingView
            onNavigateToCrm={() => setEcosystemMode('crm')}
            onLeadAddedToCrm={fetchAppLeads}
          />
        </div>
      ) : ecosystemMode === 'indicators' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col min-h-[750px]">
          <AutomatedIndicatorsView />
        </div>
      ) : ecosystemMode === 'opensquad' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col min-h-[750px]">
          <OpenSquadView
            leads={appLeads}
            onLeadsUpdated={fetchAppLeads}
            onNavigateToPipeline={() => setEcosystemMode('crm')}
          />
        </div>
      ) : ecosystemMode === 'crm' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col min-h-[750px]">
          <CrmDashboard onSendToDataAnalyst={handleSendCrmToAnalyst} />
        </div>
      ) : (
        <main className="mx-auto max-w-screen-2xl w-full px-6 pt-6">
          <AnimatePresence mode="wait">
            {(status === 'idle' || status === 'uploading') && !report ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <SetupPanel
                  files={files}
                  dragOver={dragOver}
                  question={question}
                  examples={examples}
                  canRun={canRun}
                  isUploading={status === 'uploading'}
                  suggestedQuestions={suggestedQuestions}
                  loadingSuggestions={loadingSuggestions}
                  onFetchSuggestions={fetchSuggestedQuestions}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onPickFiles={(fl) => fl && addFiles(fl)}
                  onAddGcsUri={addGcsUriFile}
                  onRemoveFile={removeFile}
                  onQuestionChange={setQuestion}
                  onRun={runAnalysis}
                />
              </motion.div>
            ) : (
              <motion.div
                key="run"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <RunHeader
                  datasetName={datasetName}
                  question={question}
                  status={status}
                  stage={stage}
                  onStop={stop}
                  onReset={reset}
                />
                {errorMsg && <ErrorBanner message={errorMsg} />}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="w-full lg:w-[360px] xl:w-[420px] shrink-0 lg:sticky lg:top-6">
                    <AgentPanel
                      messages={chatMessages}
                      logs={logs}
                      status={status}
                      stage={stage}
                      viewedMessageId={viewedMessageId}
                      onSelectMessage={selectMessage}
                      onSendFollowUp={(text) => runAnalysis(text)}
                      report={report}
                      datasetName={datasetName}
                    />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    {report ? (
                      <ReportView
                        report={report}
                        isSpeaking={isSpeaking}
                        onToggleAudio={() => toggleAudioSpeech(report.executive_summary || report.title || '')}
                        onOpenSlides={() => setIsSlideDeckOpen(true)}
                        onOpenChat={() => setIsChatOpen(true)}
                      />
                    ) : (
                      status === 'running' && (
                        <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center shadow-sm">
                          <p className="text-base font-medium text-neutral-700">O relatório está sendo gerado pela IA Gemini</p>
                          <p className="mt-1.5 max-w-sm text-sm text-neutral-500">
                            O agente autônomo está explorando seus dados, rodando análises estatísticas em Python e gerando visualizações interativas.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* Slide Deck Modal */}
      {isSlideDeckOpen && report && (
        <SlideDeckModal
          report={report}
          onClose={() => setIsSlideDeckOpen(false)}
        />
      )}

      {/* Floating Gemini Chat Sidebar */}
      <GeminiChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextReport={report}
        datasetSummary={datasetName}
      />
    </div>
  );
};

/* ─────────────────────────── Setup ─────────────────────────── */

interface SetupProps {
  files: UploadedFile[];
  dragOver: boolean;
  question: string;
  examples: string[];
  canRun: boolean;
  isUploading?: boolean;
  suggestedQuestions?: string[];
  loadingSuggestions?: boolean;
  onFetchSuggestions?: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onPickFiles: (files: FileList | null) => void;
  onAddGcsUri: (uri: string) => void;
  onRemoveFile: (name: string) => void;
  onQuestionChange: (v: string) => void;
  onRun: () => void;
}

const SetupPanel: React.FC<SetupProps> = ({
  files, dragOver, question, examples, canRun, isUploading = false,
  suggestedQuestions = [], loadingSuggestions = false, onFetchSuggestions,
  onDragOver, onDragLeave, onDrop, onPickFiles, onAddGcsUri, onRemoveFile,
  onQuestionChange, onRun
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gcsInput, setGcsInput] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6 mt-0 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
        <h1 className="text-4xl sm:text-4xl lg:text-[3.5rem] leading-[1.05] tracking-tight font-['Hanken_Grotesk'] font-bold text-[#ffe4af] w-full md:w-1/2">
          Pergunte qualquer coisa <br className="hidden sm:block" />
          sobre seus dados
        </h1>
        <div className="md:w-1/3 md:pt-1 flex flex-col justify-start">
          <p className="text-sm leading-relaxed text-[#e3e2e2] font-medium">
            AI Data Analyst & CRM com inteligência artificial Gemini para análise preditiva e geração de visualizações.
          </p>
          <p className="mt-3 text-xs text-[#d4c5ab]/80">
            Carregue arquivos CSV, Excel (.xlsx/.xls) ou JSON, digite sua dúvida de negócio e obtenha relatórios com código e gráficos em segundos.
          </p>
        </div>
      </div>

      <div className="space-y-4">
          {/* Step 1: dataset */}
          <section className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-2xl backdrop-blur-3xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ffe4af]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc107] text-[11px] text-[#3f2e00] font-bold">1</span>
                Escolha o dataset (CSV, Excel ou JSON)
              </div>
              <span className="text-xs text-[#d4c5ab]/80 font-medium">Até 15MB por arquivo</span>
            </div>

            <div
              onDragOver={isUploading ? undefined : onDragOver}
              onDragLeave={isUploading ? undefined : onDragLeave}
              onDrop={isUploading ? undefined : onDrop}
              onClick={isUploading ? undefined : () => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                isUploading 
                  ? 'border-[#4f4632] bg-[#121414]/50 cursor-wait' 
                  : dragOver 
                    ? 'border-[#ffc107] bg-amber-500/10 cursor-pointer' 
                    : 'border-[#4f4632]/60 hover:border-[#ffc107] bg-[#121414]/40 cursor-pointer'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ffc107] border-t-transparent" />
                  <p className="text-sm font-medium text-[#ffe4af] animate-pulse">Carregando e processando dataset com Gemini...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#e3e2e2]">Arraste seus arquivos CSV, Excel (.xlsx) ou JSON aqui ou clique para buscar</p>
                  <p className="mt-1 text-xs text-[#d4c5ab]/70">Conversão automática para análise tabular do agente</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .json, .tsv, text/csv, application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                multiple
                className="hidden"
                disabled={isUploading}
                onChange={(e) => onPickFiles(e.target.files)}
              />
            </div>

            {/* GCS Link input for files larger than 1MB */}
            <div className="mt-4 border-t border-[#4f4632]/30 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#ffe4af] flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-[#ffc107]" />
                  Ou insira a URI do Google Cloud Storage (gs://)
                </label>
                <span className="text-[11px] text-[#d4c5ab]/70">Suporte para grandes volumes</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="gs://bucket-name/path/to/large_dataset.csv"
                  value={gcsInput}
                  onChange={(e) => setGcsInput(e.target.value)}
                  disabled={isUploading}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#121414] border border-[#4f4632] text-[#e3e2e2] placeholder-[#d4c5ab]/40 focus:border-[#ffc107] outline-none transition disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={isUploading || !gcsInput.trim()}
                  onClick={() => {
                    if (!gcsInput.trim()) return;
                    onAddGcsUri(gcsInput.trim());
                    setGcsInput('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#ffc107] hover:bg-[#fabd00] text-[#3f2e00] text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Adicionar URI GCS
                </button>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f) => (
                  <li
                     key={f.name}
                     className="flex items-center justify-between rounded-xl border border-[#4f4632]/40 bg-[#121414] px-3.5 py-2.5 text-sm"
                  >
                     <span className="flex items-center gap-2 truncate max-w-[80%]">
                       <span className="truncate font-medium text-[#ffe4af]">{f.name}</span>
                       <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-medium truncate border border-amber-500/20">
                         {f.isGcsUri || (f.gsUri && !f.content)
                           ? `GCS • ${f.gsUri}`
                           : `Dataset • ${f.size ? (f.size / 1024).toFixed(1) : (f.content ? (f.content.length / 1024).toFixed(1) : '0')} KB`}
                       </span>
                     </span>
                     <button 
                       disabled={isUploading} 
                       onClick={(e) => { e.stopPropagation(); onRemoveFile(f.name); }} 
                       className="text-[#d4c5ab]/60 hover:text-rose-400 font-medium text-xs px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition"
                     >
                       Remover
                     </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Step 2: question */}
          <section className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-2xl backdrop-blur-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ffe4af]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc107] text-[11px] text-[#3f2e00] font-bold">2</span>
                Formule sua pergunta de negócio
              </div>
              {files.length > 0 && onFetchSuggestions && (
                <button
                  type="button"
                  onClick={onFetchSuggestions}
                  disabled={loadingSuggestions}
                  className="flex items-center gap-1.5 text-xs text-[#ffe4af] hover:text-amber-300 font-semibold cursor-pointer disabled:opacity-55"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                  {loadingSuggestions ? 'Gerando hipóteses...' : 'Sugerir com Gemini AI'}
                </button>
              )}
            </div>

            <textarea
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              disabled={isUploading}
              rows={3}
              placeholder="Ex: Quais são as principais correlações e padrões ocultos neste dataset? Quais segmentos têm maior rentabilidade?"
              className="w-full resize-none rounded-2xl bg-[#121414] border border-[#4f4632] px-4 py-3 text-sm outline-none transition focus:border-[#ffc107] disabled:opacity-50 text-[#e3e2e2] placeholder-[#d4c5ab]/40 shadow-inner"
            />

            {/* Suggested Questions by Gemini AI */}
            {suggestedQuestions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#ffe4af] flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-[#ffc107]" />
                  Hipóteses inteligentes sugeridas pelo Gemini:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onQuestionChange(sq)}
                      className="text-left rounded-xl border border-[#4f4632]/60 bg-[#121414] hover:bg-[#292a2a] px-3.5 py-2 text-xs text-[#ffe4af] transition cursor-pointer leading-snug shadow-xs"
                    >
                      ✦ {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Quick Prompts */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Resuma os principais padrões, anomalias e métricas-chave deste dataset.',
                'Identifique correlações relevantes entre as colunas numéricas e gere visualizações.',
                'Quais são os principais segmentos e qual a projeção de crescimento?',
              ].map((ex) => (
                <button
                  key={ex}
                  disabled={isUploading}
                  onClick={() => onQuestionChange(ex)}
                  className="rounded-full border border-[#4f4632]/50 bg-[#121414] px-3.5 py-1.5 text-xs text-[#d4c5ab] transition hover:border-[#ffc107] hover:text-[#ffe4af] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ex}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={onRun}
            disabled={!canRun || isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffc107] hover:bg-[#fabd00] px-6 py-4 text-sm font-bold text-[#3f2e00] shadow-[0_0_25px_rgba(250,189,0,0.3)] transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#3f2e00]" />
            Executar Análise Autônoma com Gemini
          </button>
      </div>
    </div>
  );
};

/* ─────────────────────────── Run header ─────────────────────────── */

const RunHeader: React.FC<{
  datasetName: string;
  question: string;
  status: Status;
  stage: string;
  onStop: () => void;
  onReset: () => void;
}> = ({ datasetName, question, status, stage, onStop, onReset }) => (
  <div className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-2xl backdrop-blur-3xl">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#ffe4af]">
          Dataset: {datasetName}
        </div>
        <p className="mt-1.5 truncate text-base font-semibold text-[#e3e2e2]">{question}</p>
      </div>
      {status === 'running' ? (
        <button
          onClick={onStop}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 cursor-pointer"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={onReset}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#4f4632] bg-[#121414] px-3.5 py-2 text-sm font-semibold text-[#ffe4af] transition hover:bg-[#292a2a] cursor-pointer"
        >
          New analysis
        </button>
      )}
    </div>
    {status === 'running' && (
      <div className="mt-4 flex items-center gap-2 text-sm text-[#d4c5ab]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#ffc107] animate-pulse" />
        <span>{stage || 'Working...'}</span>
      </div>
    )}
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-io-red/30 bg-red-50 px-4 py-3 text-sm text-io-red">
    <span>{message}</span>
  </div>
);

/* ─────────────────────────── Agent Panel ─────────────────────────── */

const AgentPanel: React.FC<{
  messages: ChatMessage[];
  logs: ActivityLog[];
  status: Status;
  stage: string;
  viewedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onSendFollowUp: (text: string) => void;
  report?: AnalysisReport | null;
  datasetName?: string;
}> = ({ messages, logs, status, stage, viewedMessageId, onSelectMessage, onSendFollowUp, report, datasetName }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const activityScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (status === 'running') {
      setActiveTab('activity');
    }
  }, [status]);

  useEffect(() => {
    const container = activityScrollRef.current;
    if (activeTab === 'activity' && container && shouldAutoScrollRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs, activeTab]);

  const handleActivityScroll = () => {
    if (activeTab !== 'activity') return;
    const container = activityScrollRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 80;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === 'running') return;
    onSendFollowUp(inputText.trim());
    setInputText('');
  };

  const suggestions = useMemo(() => {
    const name = (datasetName || report?.dataset_name || '').toLowerCase();
    
    // Try to find the primary table and its column names
    const firstTable = report?.tables?.[0];
    const columns = firstTable?.columns || [];
    const columnsLower = columns.map(c => c.toLowerCase());

    // 1. Cycling / Fitness / Athletic Data
    if (
      name.includes('cycling') || 
      name.includes('cycle') || 
      name.includes('ride') || 
      name.includes('ftp') || 
      name.includes('fitness') || 
      name.includes('heart') || 
      name.includes('power') || 
      columnsLower.includes('ftp') || 
      columnsLower.includes('power')
    ) {
      const suggestionsList = [];
      if (columnsLower.includes('ftp')) {
        suggestionsList.push("How has my FTP progressed over time?");
      } else {
        suggestionsList.push("Identify peak performance trends");
      }
      
      if (columnsLower.includes('power') || columnsLower.includes('watts')) {
        suggestionsList.push("Analyse my power zones and metrics");
      } else {
        suggestionsList.push("Find training volume anomalies");
      }

      if (columnsLower.includes('month') || columnsLower.includes('year')) {
        suggestionsList.push("Show seasonal patterns in my activities");
      } else {
        suggestionsList.push("Correlate intensity with training history");
      }
      return suggestionsList.slice(0, 3);
    }

    // 2. Sales / Business / Order Data
    if (
      name.includes('sales') || 
      name.includes('revenue') || 
      name.includes('order') || 
      name.includes('customer') || 
      name.includes('store') || 
      columnsLower.includes('sales') || 
      columnsLower.includes('revenue') || 
      columnsLower.includes('price')
    ) {
      return [
        "Predict next month's sales",
        "Identify outliers or anomalies",
        "Highlight top sales drivers",
      ];
    }

    // 3. User / App Usage / Web Traffic / Event Data
    if (
      name.includes('user') || 
      name.includes('traffic') || 
      name.includes('event') || 
      name.includes('click') || 
      name.includes('session') || 
      name.includes('log') || 
      columnsLower.includes('session_id') || 
      columnsLower.includes('event_type')
    ) {
      return [
        "Find user retention and churn trends",
        "Identify the busiest hours or days of traffic",
        "What are the main conversion or exit points?"
      ];
    }

    // 4. Financial / Stock / Crypto Data
    if (
      name.includes('stock') || 
      name.includes('price') || 
      name.includes('crypto') || 
      name.includes('finance') || 
      name.includes('budget') || 
      name.includes('portfolio') || 
      columnsLower.includes('close') || 
      columnsLower.includes('amount')
    ) {
      return [
        "Detect periods of highest volatility or expense spikes",
        "Forecast price trends for the next period",
        "Analyze category distribution or asset allocation"
      ];
    }

    // 5. Dynamic Fallback using column names if available!
    if (columns.length >= 2) {
      const numericCols = columns.filter((col, i) => {
        const sample = firstTable?.rows?.slice(0, 5).map(row => row[i]);
        return sample?.some(val => typeof val === 'number') || false;
      });

      const dateCols = columns.filter(col => {
        const c = col.toLowerCase();
        return c.includes('date') || c.includes('time') || c.includes('year') || c.includes('month') || c.includes('day');
      });

      if (dateCols.length > 0 && numericCols.length > 0) {
        return [
          `Analyze the trend of ${numericCols[0]} over ${dateCols[0]}`,
          `Identify anomalies or extreme values in ${numericCols[0]}`,
          `Are there any correlations between ${numericCols.slice(0, 2).join(' and ')}?`
        ];
      } else if (numericCols.length >= 2) {
        return [
          `Examine the relationship between ${numericCols[0]} and ${numericCols[1]}`,
          `Find outliers or anomalies in our numeric columns`,
          `Provide a descriptive statistics summary of the columns`
        ];
      }
    }

    // 6. Completely Generic Universal Fallbacks
    return [
      "Identify outliers or anomalies in the dataset",
      "What are the most significant correlations or patterns?",
      "Provide strategic recommendations based on this data"
    ];
  }, [report, datasetName]);

  return (
    <div className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] shadow-2xl flex flex-col h-[75vh] relative overflow-hidden backdrop-blur-3xl">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-[#4f4632]/40 px-5 py-3 text-sm font-semibold text-[#ffe4af] bg-[#121414]/60">
        <span>Analytics Agent</span>
        {status === 'running' && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#d4c5ab] font-normal">
            {stage || 'Working...'}
          </span>
        )}
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex border-b border-[#4f4632]/40 bg-[#121414]/40 p-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
              : 'text-[#d4c5ab] hover:text-[#ffe4af]'
          }`}
        >
          <span>Chat</span>
          {messages.length > 0 && (
            <span className="bg-[#121414] text-[#ffe4af] text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-[#4f4632]/40">
              {messages.filter(m => m.role === 'assistant').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#ffe4af] text-[#3f2e00] shadow-md font-bold'
              : 'text-[#d4c5ab] hover:text-[#ffe4af]'
          }`}
        >
          <span>Agent Activity</span>
          {status === 'running' && (
            <span className="h-2 w-2 rounded-full bg-[#ffc107] animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div
        ref={activityScrollRef}
        onScroll={handleActivityScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar"
      >
        {activeTab === 'chat' ? (
          messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#d4c5ab]/60">
              <p className="text-sm font-semibold text-[#ffe4af]">Agent Session</p>
              <p className="text-xs max-w-xs mt-1">Start your analysis to chat with the agent and drill down into insights.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isActive = viewedMessageId === msg.id;

              if (isUser) {
                return (
                  <div key={msg.id} className="self-end max-w-[85%] bg-[#ffc107] text-[#3f2e00] rounded-2xl rounded-tr-none px-4 py-2.5 text-sm font-medium shadow-md">
                    <p className="leading-relaxed break-words">{msg.text}</p>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  onClick={() => msg.report && onSelectMessage(msg.id)}
                  className={`self-start max-w-[95%] w-full rounded-2xl rounded-tl-none p-4 border transition text-sm flex flex-col space-y-2.5 shadow-md ${
                    msg.report ? 'cursor-pointer' : ''
                  } ${
                    isActive
                      ? 'border-[#ffc107] bg-[#121414] ring-1 ring-[#ffc107]/40'
                      : 'border-[#4f4632]/50 bg-[#121414]/90 hover:border-[#ffc107]/60'
                  }`}
                >
                  {/* Assistant header indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ffe4af]">
                      <span>AI DATA ANALYST</span>
                    </div>
                    {msg.report && (
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive ? 'bg-[#ffc107] text-[#3f2e00]' : 'bg-[#1e2020] text-[#d4c5ab]'
                      }`}>
                        {isActive ? 'Showing on Dashboard' : 'Click to view'}
                      </span>
                    )}
                  </div>

                  {/* Response Text / Streaming Text */}
                  {msg.text ? (
                    <div className="space-y-3">
                      <FormattedMarkdown content={msg.text} />
                      {msg.report && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMessage(msg.id);
                          }}
                          className={`p-3 rounded-xl border transition-all space-y-2 text-xs text-left ${
                            isActive 
                              ? 'border-emerald-500/40 bg-emerald-500/10' 
                              : 'border-[#4f4632]/60 bg-[#1e2020] hover:border-[#ffc107]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#121414] text-[#ffe4af]'}`}>
                              <Presentation className="h-3.5 w-3.5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#ffe4af] truncate">Proposed Dashboard Update</p>
                              <p className="text-[10px] text-[#d4c5ab]/70 truncate">
                                {isActive ? 'Currently active on dashboard and PDF' : 'Click to apply these new insights to the active report'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {isActive ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-md">
                                <Check className="h-3 w-3" />
                                Active & Ready for PDF
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectMessage(msg.id);
                                }}
                                className="text-[11px] font-bold text-[#3f2e00] bg-[#ffc107] hover:bg-[#fabd00] px-3 py-1.5 rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-2.5 w-2.5" />
                                Apply to Dashboard
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.status === 'running' && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex space-x-1.5 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ffc107] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ffc107] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ffc107] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-[#d4c5ab] italic font-mono">{msg.stage || 'Analyzing data...'}</span>
                      </div>
                    )
                  )}

                  {/* Execution logs / steps */}
                  {msg.logs && msg.logs.length > 0 && (
                    <div className="pt-2 border-t border-[#4f4632]/40" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="text-xs text-[#ffe4af] hover:underline font-semibold flex items-center gap-1.5 py-1 focus:outline-none cursor-pointer"
                      >
                        View full execution steps
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="w-full space-y-3">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#d4c5ab]/60">
                <p className="text-sm font-semibold text-[#ffe4af]">Waiting for Agent Activity...</p>
                <p className="text-xs max-w-xs mt-1">When the analysis runs, all Python executions, data profiling tasks, and visual operations will show up here.</p>
              </div>
            ) : (
              <div className="space-y-3.5 pr-1">
                {logs.map((log) => (
                  <ActivityRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions Pills */}
      {status !== 'running' && messages.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[#4f4632]/40 flex flex-wrap gap-1.5 bg-[#121414]/40">
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => onSendFollowUp(sug)}
              className="text-xs font-medium text-[#ffe4af] hover:text-white bg-[#121414] hover:bg-[#292a2a] px-3 py-1 rounded-xl border border-[#4f4632]/50 transition cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="border-t border-[#4f4632]/40 p-3 bg-[#121414]/80">
        <div className="relative flex items-center">
          <input
            type="text"
            disabled={status === 'running'}
            placeholder={status === 'running' ? "AI is typing, please wait..." : "Ask a follow-up question..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-4 pr-16 py-3 text-sm rounded-2xl bg-[#1e2020] border border-[#4f4632] focus:border-[#ffc107] outline-none transition text-[#e3e2e2] placeholder-[#d4c5ab]/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'running' || !inputText.trim()}
            className="absolute right-2 top-1.5 px-3.5 py-2 rounded-xl bg-[#ffc107] text-[#3f2e00] text-xs font-bold hover:bg-[#fabd00] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const ActivityRow: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const [open, setOpen] = useState(false);

  if (log.type === 'thinking' || log.type === 'text') {
    const isThinking = log.type === 'thinking';
    return (
      <div className="flex gap-2 text-sm">
        <span className="mt-0.5 shrink-0 text-[#ffe4af] font-bold">•</span>
        <div className={`flex-1 min-w-0 ${isThinking ? 'italic text-[#d4c5ab]/70' : 'text-[#e3e2e2]'}`}>
          <FormattedMarkdown content={log.content} />
        </div>
      </div>
    );
  }

  if (log.type === 'tool_call') {
    const args = (log.args || {}) as Record<string, any>;
    let cmd = args.command || args.code || args.content;
    let pathVal = args.path || args.file || args.TargetFile;
    
    if (!cmd && args.arguments && typeof args.arguments === 'object') {
      const subArgs = args.arguments as Record<string, any>;
      cmd = subArgs.command || subArgs.code || subArgs.content;
      pathVal = pathVal || subArgs.path || subArgs.file || subArgs.TargetFile;
    }
    
    cmd = cmd ? String(cmd) : '';
    const displayPath = pathVal ? String(pathVal) : '';
    const hasDetails = Boolean(cmd || Object.keys(args).length > 0);
    
    return (
      <div className="rounded-xl border border-[#4f4632]/50 bg-[#121414] text-sm">
        <button onClick={() => setOpen((o) => !o)} className={`flex w-full items-center gap-2 px-3 py-2 text-left ${!hasDetails ? 'pointer-events-none' : ''}`}>
          <span className="font-mono text-[11px] text-[#ffe4af] break-all">
            {log.name || 'tool'} {displayPath ? <span className="text-[#d4c5ab]/60"> {displayPath}</span> : ''}
          </span>
          {hasDetails && <span className="ml-auto text-xs text-[#d4c5ab] font-bold transition">{open ? '▲' : '▼'}</span>}
        </button>
        {open && hasDetails && (
          <pre className="overflow-x-auto max-h-60 border-t border-[#4f4632]/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#ffe4af]">
            {cmd || JSON.stringify(args, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (log.type === 'tool_result') {
    return (
      <div className="rounded-xl border border-[#4f4632]/50 bg-[#121414] text-sm">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
          <span className="text-xs text-[#ffe4af] font-semibold">Output{log.name ? ` · ${log.name}` : ''}</span>
          <span className="ml-auto text-xs text-[#d4c5ab] font-bold transition">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <pre className="max-h-60 overflow-auto border-t border-[#4f4632]/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-[#d4c5ab]">
            {log.result}
          </pre>
        )}
      </div>
    );
  }

  if (log.type === 'error') {
    return (
      <div className="flex gap-2 text-sm text-rose-400 font-medium">
        <span>Error: {log.content}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 text-sm text-[#d4c5ab]">
      <span className="mt-0.5 shrink-0">·</span>
      <div className="flex-1 min-w-0">
        <FormattedMarkdown content={log.content} />
      </div>
    </div>
  );
};

/* ─────────────────────────── Dashboard & Report view ─────────────────────────── */

type DashboardTab = 'overview' | 'charts' | 'tables' | 'recommendations' | 'print';

const ReportView: React.FC<{
  report: AnalysisReport;
  isSpeaking?: boolean;
  onToggleAudio?: () => void;
  onOpenSlides?: () => void;
  onOpenChat?: () => void;
}> = ({ report, isSpeaking, onToggleAudio, onOpenSlides, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [zoomedChart, setZoomedChart] = useState<ReportChart | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const validCharts = useMemo(() => {
    return report.charts?.filter((c) => c.image) || [];
  }, [report.charts]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(report.dataset_name || 'report').replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDashboardToExcel = () => {
    if (!report.tables || report.tables.length === 0) return;

    const workbook = XLSX.utils.book_new();

    report.tables.forEach((table, index) => {
      const sheetName = table.title ? table.title.substring(0, 31) : `Table ${index + 1}`;
      const worksheet = XLSX.utils.aoa_to_sheet([table.columns, ...table.rows]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, `${(report.dataset_name || 'report').replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  };

  const exportDashboardToPDF = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 15;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      // Top accent bar
      pdf.setFillColor(66, 133, 244);
      pdf.rect(0, 0, pageWidth, 4, 'F');

      y = 15;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(66, 133, 244);
      pdf.text(`${(report.dataset_name || 'DATASET').toUpperCase()} · EXECUTIVE INTELLIGENCE REPORT`, margin, y);

      y += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(31, 41, 55);
      const titleLines = pdf.splitTextToSize(report.title || 'Analysis Report', contentWidth);
      pdf.text(titleLines, margin, y);
      y += titleLines.length * 8 + 1;

      // Inquiry
      if (report.question) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5);
        pdf.setTextColor(75, 85, 99);
        const qLines = pdf.splitTextToSize(`Business Inquiry: ${report.question}`, contentWidth);
        pdf.text(qLines, margin, y);
        y += qLines.length * 6 + 4;
      }

      // Divider
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, margin + contentWidth, y);
      y += 8;

      // Executive Summary Box
      if (report.executive_summary) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Executive AI Takeaway', margin, y);
        y += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const execLines = pdf.splitTextToSize(report.executive_summary, contentWidth - 10);
        const boxHeight = execLines.length * 5 + 8;

        checkPageBreak(boxHeight + 5);

        pdf.setFillColor(243, 244, 246);
        pdf.setDrawColor(209, 213, 219);
        pdf.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

        pdf.text(execLines, margin + 5, y + 7);
        y += boxHeight + 10;
      }

      // KPI Metrics
      if (report.insights && report.insights.length > 0) {
        checkPageBreak(35);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Key Performance Indicators', margin, y);
        y += 7;

        const kpis = report.insights.slice(0, 4);
        const colWidth = (contentWidth - 6) / 2;

        for (let i = 0; i < kpis.length; i += 2) {
          const rowKpis = kpis.slice(i, i + 2);
          const maxRowHeight = 26;

          checkPageBreak(maxRowHeight + 4);

          rowKpis.forEach((kpi, colIdx) => {
            const x = margin + colIdx * (colWidth + 6);
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(229, 231, 235);
            pdf.roundedRect(x, y, colWidth, maxRowHeight, 2, 2, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(107, 114, 128);
            pdf.text((kpi.metric || kpi.title || '').toUpperCase().slice(0, 32), x + 4, y + 6);

            if (kpi.value) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(11);
              pdf.setTextColor(66, 133, 244);
              pdf.text(String(kpi.value).slice(0, 25), x + 4, y + 13);
            }

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
            pdf.setTextColor(55, 65, 81);
            const detailLines = pdf.splitTextToSize(kpi.detail || kpi.title || '', colWidth - 8);
            pdf.text(detailLines.slice(0, 2), x + 4, y + (kpi.value ? 19 : 13));
          });

          y += maxRowHeight + 6;
        }
        y += 4;
      }

      // Charts
      const validCharts = report.charts?.filter((c) => c.image) || [];
      if (validCharts.length > 0) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Visual Analytics', margin, y);
        y += 8;

        for (const chart of validCharts) {
          checkPageBreak(40);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(31, 41, 55);
          pdf.text(chart.title || 'Chart', margin, y);
          y += 5;

          if (chart.caption) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(107, 114, 128);
            const capLines = pdf.splitTextToSize(chart.caption, contentWidth);
            pdf.text(capLines, margin, y);
            y += capLines.length * 4.5 + 3;
          }

          try {
            let imageSourceUrl = chart.image;
            if (imageSourceUrl.startsWith('/') || imageSourceUrl.startsWith('http')) {
              try {
                const res = await fetch(imageSourceUrl);
                if (res.ok) {
                  const blob = await res.blob();
                  imageSourceUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  });
                }
              } catch (fetchErr) {
                console.warn('Failed to fetch chart image as blob for PDF export:', fetchErr);
              }
            }

            const imgProps = await new Promise<{ dataUrl: string; width: number; height: number }>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.naturalWidth || 600;
                  canvas.height = img.naturalHeight || 400;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                  }
                  resolve({
                    dataUrl: canvas.toDataURL('image/png'),
                    width: canvas.width,
                    height: canvas.height
                  });
                } catch (e) {
                  resolve({
                    dataUrl: imageSourceUrl,
                    width: img.naturalWidth || 600,
                    height: img.naturalHeight || 400
                  });
                }
              };
              img.onerror = () => {
                resolve({
                  dataUrl: imageSourceUrl,
                  width: 600,
                  height: 400
                });
              };
              img.src = imageSourceUrl;
            });

            const maxImgW = contentWidth;
            const maxImgH = 100;
            let imgW = maxImgW;
            let imgH = (imgProps.height * imgW) / imgProps.width;

            if (imgH > maxImgH) {
              imgH = maxImgH;
              imgW = (imgProps.width * imgH) / imgProps.height;
            }

            checkPageBreak(imgH + 10);

            const imgX = margin + (contentWidth - imgW) / 2;
            pdf.setDrawColor(243, 244, 246);
            pdf.rect(imgX - 1, y - 1, imgW + 2, imgH + 2);
            pdf.addImage(imgProps.dataUrl, 'PNG', imgX, y, imgW, imgH);
            y += imgH + 10;
          } catch (err) {
            console.warn('Could not render chart in PDF', err);
          }
        }
      }

      // Tables
      if (report.tables && report.tables.length > 0) {
        checkPageBreak(25);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Supporting Data Tables', margin, y);
        y += 6;

        for (const table of report.tables) {
          checkPageBreak(20);

          autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [table.columns],
            body: table.rows.slice(0, 40).map((row) =>
              row.map((cell) => (cell === null ? '—' : String(cell)))
            ),
            headStyles: {
              fillColor: [66, 133, 244],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 8.5
            },
            bodyStyles: {
              textColor: [55, 65, 81],
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251]
            }
          });

          y = (pdf as any).lastAutoTable?.finalY ? (pdf as any).lastAutoTable.finalY + 10 : y + 30;
        }
      }

      // Recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Strategic Recommendations', margin, y);
        y += 7;

        report.recommendations.forEach((rec, idx) => {
          const recLines = pdf.splitTextToSize(`${idx + 1}.  ${rec}`, contentWidth - 6);
          const itemH = recLines.length * 5 + 3;
          checkPageBreak(itemH);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(55, 65, 81);
          pdf.text(recLines, margin + 2, y);
          y += itemH;
        });
        y += 6;
      }

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.setDrawColor(243, 244, 246);
        pdf.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

        pdf.text(`AI Data Analyst Autonomous BI · Generated ${report.generated_at || new Date().toLocaleDateString()}`, margin, pageHeight - 7);
        pdf.text(`Page ${i} of ${totalPages}`, margin + contentWidth - 18, pageHeight - 7);
      }

      const cleanName = (report.dataset_name || 'AI_Analysis').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${cleanName}_Executive_Dashboard.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Top KPI Metrics
  const kpiInsights = useMemo(() => {
    return report.insights?.slice(0, 4) || [];
  }, [report.insights]);

  return (
    <div className="space-y-6">
      {/* Dashboard Top Navigation & Header */}
      <section className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ffc107] to-[#fabd00]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                {report.dataset_name}
              </span>
              {report.generated_at && (
                <span className="text-xs text-[#d4c5ab]/70 font-mono">
                  {report.generated_at}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#ffe4af] font-['Hanken_Grotesk']">
              {report.title}
            </h2>
            <p className="mt-1 text-sm text-[#d4c5ab] line-clamp-2">
              <span className="font-semibold text-[#ffe4af]">Inquiry: </span>
              {report.question}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#121414] text-[#ffe4af] hover:bg-[#292a2a] border border-[#4f4632]'
                }`}
                title="Resumo Executivo em Áudio (TTS)"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? 'Pausar Áudio' : 'Ouvir Resumo'}
              </button>
            )}

            {onOpenSlides && (
              <button
                onClick={onOpenSlides}
                className="flex items-center gap-1.5 rounded-xl bg-[#121414] hover:bg-[#292a2a] border border-[#4f4632] text-[#ffe4af] px-3.5 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-[#ffc107]" />
                Slides
              </button>
            )}

            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 rounded-xl bg-[#121414] text-[#ffe4af] hover:bg-[#292a2a] border border-[#4f4632] px-3.5 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#ffc107]" />
                Chat Gemini
              </button>
            )}

            <button
              onClick={exportDashboardToPDF}
              disabled={isExportingPdf}
              className="flex items-center gap-2 rounded-xl bg-[#ffc107] hover:bg-[#fabd00] px-4 py-2.5 text-xs font-bold text-[#3f2e00] shadow-[0_0_20px_rgba(250,189,0,0.3)] transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
            >
              {isExportingPdf ? 'Gerando PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={exportDashboardToExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-95 cursor-pointer"
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 rounded-xl border border-[#4f4632] bg-[#121414] px-3 py-2.5 text-xs font-medium text-[#ffe4af] transition hover:bg-[#292a2a] cursor-pointer"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="mt-6 pt-4 border-t border-[#4f4632]/40 flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
          <TabBtn
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Overview"
          />
          <TabBtn
            active={activeTab === 'charts'}
            onClick={() => setActiveTab('charts')}
            label="Visualizations"
            badge={validCharts.length}
          />
          <TabBtn
            active={activeTab === 'tables'}
            onClick={() => setActiveTab('tables')}
            label="Data Tables"
            badge={report.tables?.length || 0}
          />
          <TabBtn
            active={activeTab === 'recommendations'}
            onClick={() => setActiveTab('recommendations')}
            label="Insights & Actions"
          />
          <TabBtn
            active={activeTab === 'print'}
            onClick={() => setActiveTab('print')}
            label="Print Preview"
          />
        </div>
      </section>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {kpiInsights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpiInsights.map((kpi, idx) => {
                const seed = (kpi.title || '').length + idx * 13;
                const base = 30 + (seed % 40);
                const sparkData = [
                  { v: base },
                  { v: base + ((seed % 5) - 2) * 4 },
                  { v: base + (seed % 12) },
                  { v: base + ((seed % 7) * 3) },
                  { v: base + 15 + (seed % 10) },
                  { v: base + 25 + (seed % 18) },
                ];
                // Determine trend direction: compare last point vs first point (or use kpi sentiment if available)
                const isUpward = sparkData[sparkData.length - 1].v >= sparkData[0].v;
                const strokeColor = isUpward ? '#22c55e' : '#ef4444'; // green-500 for upward, red-500 for downward
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-xl flex flex-col justify-between hover:border-[#ffc107]/50 transition min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#d4c5ab]/80 truncate" title={kpi.metric || kpi.title}>
                        {kpi.metric || kpi.title}
                      </span>
                    </div>
                    <div className="mt-2 text-xl sm:text-2xl xl:text-3xl font-extrabold text-[#ffe4af] font-['Hanken_Grotesk'] tracking-tight leading-tight break-words py-1">
                      {kpi.value || 'Key Trend'}
                    </div>
                    <p className="mt-1 text-xs text-[#d4c5ab] line-clamp-2 leading-relaxed">
                      {kpi.detail}
                    </p>
                    <div className="mt-3 h-10 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#121414] border border-[#4f4632] px-2 py-1 rounded text-[10px] text-[#ffe4af] shadow">
                                    {payload[0].value}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Executive Summary AI Box */}
          <div className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ffe4af] mb-2 font-['Hanken_Grotesk']">
              Executive AI Takeaway
            </div>
            <FormattedMarkdown content={report.executive_summary} />
          </div>

          {/* Bento Split: Top Charts & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle title="Featured Visualizations" />
                {validCharts.length > 2 && (
                  <button onClick={() => setActiveTab('charts')} className="text-xs text-[#ffe4af] hover:underline font-semibold cursor-pointer">
                    View all {validCharts.length} charts →
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {validCharts.slice(0, 2).map((c, i) => (
                  <ChartCard key={i} chart={c} index={i} onZoom={() => setZoomedChart(c)} />
                ))}
                {validCharts.length === 0 && (
                  <p className="col-span-2 p-8 text-center text-sm text-[#d4c5ab]/60 bg-[#1e2020] rounded-3xl border border-[#4f4632]/50">
                    No visual charts generated for this query.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <SectionTitle title="Priority Actions" />
              <div className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-xl space-y-3.5">
                {report.recommendations && report.recommendations.length > 0 ? (
                  report.recommendations.slice(0, 4).map((rec, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#e3e2e2]">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#ffc107] shrink-0" />
                      <span className="leading-snug">{rec}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#d4c5ab]/60 italic">No specific recommendations emitted.</p>
                )}
                {report.recommendations && report.recommendations.length > 4 && (
                  <button onClick={() => setActiveTab('recommendations')} className="pt-2 text-xs text-[#ffe4af] hover:underline font-semibold block cursor-pointer">
                    + {report.recommendations.length - 4} more recommendations →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Visualizations */}
      {activeTab === 'charts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle title={`All Visualizations (${validCharts.length})`} />
            <span className="text-xs text-[#d4c5ab]/70">Click any chart to inspect in full resolution</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {validCharts.map((c, i) => (
              <ChartCard key={i} chart={c} index={i} onZoom={() => setZoomedChart(c)} />
            ))}
            {validCharts.length === 0 && (
              <p className="col-span-2 p-12 text-center text-sm text-[#d4c5ab]/60 bg-[#1e2020] rounded-3xl border border-[#4f4632]/50">
                No visual charts generated for this analysis.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Tables */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e2020] p-5 rounded-3xl border border-[#4f4632]/50">
            <SectionTitle title={`Supporting Data Tables (${report.tables?.length || 0})`} />
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search rows across tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 text-xs rounded-xl bg-[#121414] border border-[#4f4632] text-[#e3e2e2] placeholder-[#d4c5ab]/40 focus:border-[#ffc107] outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            {report.tables?.map((t, i) => (
              <DataTable key={i} table={t} searchQuery={searchQuery} />
            ))}
            {(!report.tables || report.tables.length === 0) && (
              <p className="p-12 text-center text-sm text-[#d4c5ab]/60 bg-[#1e2020] rounded-3xl border border-[#4f4632]/50">
                No tabular data structures returned.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Recommendations & Insights */}
      {activeTab === 'recommendations' && (
        <div className="space-y-8">
          {report.recommendations && report.recommendations.length > 0 && (
            <section className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-xl">
              <SectionTitle title="Strategic Recommendations Roadmap" />
              <div className="grid gap-3 mt-4 sm:grid-cols-2">
                {report.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[#121414] border border-[#4f4632]/40">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffc107] text-[#3f2e00] text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#e3e2e2] leading-snug pt-0.5">{r}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {report.insights?.length > 0 && (
            <section>
              <SectionTitle title="Comprehensive AI Insights" />
              <div className="grid gap-4 sm:grid-cols-2 mt-3">
                {report.insights.map((ins, i) => (
                  <div key={i} className="rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] p-6 shadow-xl">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-bold text-[#ffe4af] text-base font-['Hanken_Grotesk']">{ins.title}</h3>
                      {ins.value && (
                        <span className="shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm font-bold text-[#ffc107]">
                          {ins.value}
                        </span>
                      )}
                    </div>
                    {ins.metric && <p className="mt-1 text-xs uppercase font-mono tracking-wider text-[#d4c5ab]/70">{ins.metric}</p>}
                    <p className="mt-3 text-sm leading-relaxed text-[#d4c5ab]">{ins.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab 5: Print Preview OR Hidden Print Target */}
      <div 
        id="dashboard-printable-report" 
        className={
          activeTab === 'print'
            ? "space-y-8 bg-[#1e2020] p-8 sm:p-12 rounded-3xl border border-[#4f4632]/50 shadow-2xl text-[#e3e2e2] max-w-4xl mx-auto backdrop-blur-3xl"
            : "fixed left-[-9999px] top-0 w-[1000px] bg-[#1e2020] p-12 text-[#e3e2e2] pointer-events-none z-[-999] space-y-8"
        }
      >
        {/* Report Header Banner */}
        <div className="border-b border-[#4f4632]/40 pb-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ffe4af]">
              {report.dataset_name} Executive Intelligence Dashboard
            </span>
            <span className="text-xs text-[#d4c5ab]/70 font-mono">
              {report.generated_at || new Date().toLocaleString()}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#ffe4af] font-['Hanken_Grotesk']">
            {report.title}
          </h1>
          <p className="mt-2 text-sm text-[#d4c5ab]">
            <span className="font-semibold text-[#ffe4af]">Business Inquiry: </span>
            {report.question}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="rounded-2xl bg-[#121414] p-6 border border-[#4f4632]/50">
          <h2 className="text-base font-bold text-[#ffe4af] flex items-center gap-2 mb-2 uppercase tracking-wide font-['Hanken_Grotesk']">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-[#e3e2e2]">
            {report.executive_summary}
          </p>
        </div>

        {/* KPI Metrics */}
        {report.insights?.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#ffe4af] mb-4 uppercase tracking-wide font-['Hanken_Grotesk']">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 gap-4">
              {report.insights.map((ins, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#4f4632]/50 bg-[#121414] break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs uppercase font-semibold text-[#d4c5ab]/70">{ins.metric || ins.title}</span>
                    {ins.value && <span className="text-xs font-bold text-[#3f2e00] bg-[#ffc107] px-2 py-0.5 rounded">{ins.value}</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-[#ffe4af] mb-1">{ins.title}</h3>
                  <p className="text-xs text-[#d4c5ab] leading-relaxed">{ins.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {validCharts.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#ffe4af] mb-4 uppercase tracking-wide font-['Hanken_Grotesk']">Visualizations & Analytics</h2>
            <div className="grid grid-cols-1 gap-8">
              {validCharts.map((c, idx) => (
                <div key={idx} className="border border-[#4f4632]/50 rounded-2xl p-6 bg-[#121414] break-inside-avoid">
                  <h3 className="text-base font-bold text-[#ffe4af] mb-1">{c.title}</h3>
                  {c.caption && <p className="text-xs text-[#d4c5ab]/70 mb-4">{c.caption}</p>}
                  <ChartImage src={c.image} alt={c.title} className="w-full max-h-[480px] object-contain mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Tables */}
        {report.tables?.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#ffe4af] mb-4 uppercase tracking-wide font-['Hanken_Grotesk']">Supporting Data Tables</h2>
            <div className="space-y-6">
              {report.tables.map((t, idx) => (
                <div key={idx} className="border border-[#4f4632]/50 rounded-2xl overflow-hidden break-inside-avoid bg-[#121414]">
                  <div className="bg-[#1e2020] px-4 py-3 border-b border-[#4f4632]/50">
                    <h3 className="text-sm font-bold text-[#ffe4af]">{t.title}</h3>
                    {t.caption && <p className="text-xs text-[#d4c5ab]/70">{t.caption}</p>}
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#121414] border-b border-[#4f4632]/50 text-left">
                        {t.columns.map((col, cIdx) => (
                          <th key={cIdx} className="px-3 py-2 font-semibold text-[#ffe4af]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.rows.slice(0, 20).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-[#4f4632]/30 last:border-0 hover:bg-[#1e2020]/50">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-3 py-1.5 text-[#e3e2e2]">{cell === null ? '—' : String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {t.rows.length > 20 && (
                    <div className="px-3 py-2 bg-[#1e2020] text-[11px] text-[#d4c5ab]/60 italic text-center">
                      Showing top 20 rows of {t.rows.length} total rows.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="rounded-2xl bg-[#121414] p-6 border border-[#4f4632]/50 break-inside-avoid">
            <h2 className="text-base font-bold text-[#ffe4af] mb-3 uppercase tracking-wide font-['Hanken_Grotesk']">
              Strategic Recommendations Roadmap
            </h2>
            <ul className="space-y-2.5">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-[#e3e2e2] flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[#ffc107] shrink-0" />
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Methodology & Footer */}
        <div className="border-t border-[#4f4632]/40 pt-4 flex justify-between text-[11px] text-[#d4c5ab]/60 font-mono">
          <span>AI Data Analyst Autonomous Agent</span>
          <span>{report.methodology ? `Methodology: ${report.methodology}` : 'Confidential BI Dashboard'}</span>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {zoomedChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedChart(null)}
            className="fixed inset-0 z-50 bg-[#121414]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e2020] border border-[#4f4632]/60 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#4f4632]/50 bg-[#121414]">
                <div>
                  <h3 className="font-bold text-[#ffe4af] text-lg font-['Hanken_Grotesk']">{zoomedChart.title}</h3>
                  {zoomedChart.caption && <p className="text-xs text-[#d4c5ab]/70 mt-0.5">{zoomedChart.caption}</p>}
                </div>
                <button
                  onClick={() => setZoomedChart(null)}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-[#ffe4af] bg-[#1e2020] hover:bg-[#292a2a] border border-[#4f4632] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-[#121414]">
                <ChartImage src={zoomedChart.image} alt={zoomedChart.title} className="max-h-[75vh] w-auto object-contain mx-auto" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}> = ({ active, onClick, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
      active
        ? 'bg-[#ffc107] text-[#3f2e00] shadow-md font-bold'
        : 'text-[#d4c5ab] hover:bg-[#121414] hover:text-[#ffe4af]'
    }`}
  >
    <span>{label}</span>
    {typeof badge === 'number' && (
      <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
        active ? 'bg-[#3f2e00]/20 text-[#3f2e00]' : 'bg-[#121414] text-[#ffe4af]'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 text-sm font-bold text-[#ffe4af] font-['Hanken_Grotesk']">
    {title}
  </div>
);

const ChartImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-[#121414] rounded-2xl border border-dashed border-[#4f4632] text-[#d4c5ab]/60 text-xs text-center min-h-[140px] w-full ${className}`}>
        <span>📈 Chart image expired or unavailable</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const ChartCard: React.FC<{ chart: ReportChart; onZoom?: () => void; index?: number }> = ({ chart, onZoom, index = 0 }) => (
  <motion.figure
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="overflow-hidden rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] shadow-xl flex flex-col group transition hover:border-[#ffc107]/50"
  >
    <div className="relative bg-[#121414]/60 p-4 flex-1 flex items-center justify-center min-h-[220px]">
      <ChartImage src={chart.image} alt={chart.title} className="w-full h-auto max-h-72 object-contain mx-auto" />
      {onZoom && (
        <button
          onClick={onZoom}
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#121414] hover:bg-[#292a2a] text-[#ffe4af] px-3 py-1.5 rounded-xl text-xs flex items-center border border-[#4f4632] shadow-md cursor-pointer font-semibold"
          title="Zoom Chart"
        >
          Zoom
        </button>
      )}
    </div>
    <figcaption className="border-t border-[#4f4632]/40 px-5 py-4 bg-[#1e2020]">
      <p className="text-sm font-bold text-[#ffe4af] font-['Hanken_Grotesk']">{chart.title}</p>
      {chart.caption && <p className="mt-1 text-xs text-[#d4c5ab] line-clamp-2">{chart.caption}</p>}
    </figcaption>
  </motion.figure>
);

const DataTable: React.FC<{ table: ReportTable; searchQuery?: string }> = ({ table, searchQuery = '' }) => {
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return table.rows;
    const lower = searchQuery.toLowerCase();
    return table.rows.filter((row) =>
      row.some((cell) => cell !== null && String(cell).toLowerCase().includes(lower))
    );
  }, [table.rows, searchQuery]);

  return (
    <div className="overflow-hidden rounded-3xl border border-[#4f4632]/50 bg-[#1e2020] shadow-xl">
      <div className="border-b border-[#4f4632]/40 px-6 py-4 flex items-center justify-between bg-[#121414]/60">
        <div>
          <p className="text-sm font-bold text-[#ffe4af] font-['Hanken_Grotesk']">{table.title}</p>
          {table.caption && <p className="mt-0.5 text-xs text-[#d4c5ab]/70">{table.caption}</p>}
        </div>
        <span className="text-xs font-mono text-[#ffe4af] bg-[#121414] px-3 py-1 rounded-xl border border-[#4f4632]/50">
          {filteredRows.length} {filteredRows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#121414] shadow-xs">
            <tr className="border-b border-[#4f4632]/50 text-left">
              {table.columns.map((c, i) => (
                <th key={i} className="px-4 py-3 font-bold text-[#ffe4af] whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4f4632]/30">
            {filteredRows.map((row, ri) => (
              <tr key={ri} className="transition hover:bg-[#121414]/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 text-[#e3e2e2] whitespace-nowrap">
                    {cell === null ? <span className="text-[#d4c5ab]/40">—</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={table.columns.length} className="px-4 py-8 text-center text-xs text-[#d4c5ab]/60">
                  No matching rows found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;


