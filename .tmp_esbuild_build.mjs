import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [path.resolve(__dirname, 'server.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: path.resolve(__dirname, 'dist', 'server.cjs'),
  external: [
    // Node built-ins and packages that should not be bundled
    'express',
    'multer',
    'dotenv',
    'xlsx',
    'docx',
    'archiver',
    'jspdf',
    'jspdf-autotable',
    'pako',
    'jszip',
    'stripe',
    'resend',
    '@google/genai',
    '@google-cloud/storage',
    '@supabase/supabase-js',
    'firebase',
    'firebase-admin',
    'googleapis',
    'html2canvas',
    'react',
    'react-dom',
    'recharts',
    'framer-motion',
    'react-markdown',
    'remark-gfm',
    'lucide-react',
  ],
  banner: {
    js: `/**
 * Foco em Dados - Server Bundle (CJS)
 * Built: ${new Date().toISOString()}
 * Entry: server.ts → dist/server.cjs
 */`,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: false,
  sourcemap: false,
  target: 'node18',
  logLevel: 'info',
});

console.log('[esbuild] ✅ dist/server.cjs gerado com sucesso');
