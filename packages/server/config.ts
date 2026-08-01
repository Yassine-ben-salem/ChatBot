import dotenv from 'dotenv';

dotenv.config();

export const SESSION_COOKIE_NAME = 'sid';
export const MAX_HISTORY_MESSAGES = 20;
export const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;
export const CHAT_RATE_LIMIT_MAX_REQUESTS = 20;
export const CLIENT_ORIGIN =
   process.env.CLIENT_ORIGIN || 'http://localhost:5173';
