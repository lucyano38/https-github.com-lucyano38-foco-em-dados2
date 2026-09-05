/**
 * Vercel Serverless Function Entry Point
 *
 * Imports the Express app from server.ts and re-exports it.
 * Vercel automatically bundles this as a serverless function.
 * All /api/* routes are handled by the Express app.
 */
import app from '../server';

export default app;
