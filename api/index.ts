/**
 * Vercel Serverless Function Entry Point
 *
 * This file is the entry point for the /api serverless function.
 * It loads the Express app from server.ts via a require() call
 * that works with Vercel's bundler.
 */
const path = require('path');

// Dynamic import to work with Vercel's ESM bundler
async function loadApp() {
  const mod = await import('../server.ts');
  return mod.default || mod;
}

// For Vercel, we export a default handler that wraps the Express app
export default async function handler(req: any, res: any) {
  const app = await loadApp();
  return app(req, res);
}

// Also export the app directly for Vercel's Express integration
export { loadApp as app };
