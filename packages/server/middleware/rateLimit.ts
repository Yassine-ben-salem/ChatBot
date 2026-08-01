import rateLimit from 'express-rate-limit';
import {
   CHAT_RATE_LIMIT_WINDOW_MS,
   CHAT_RATE_LIMIT_MAX_REQUESTS,
} from '../config';

export const chatRateLimiter = rateLimit({
   windowMs: CHAT_RATE_LIMIT_WINDOW_MS,
   limit: CHAT_RATE_LIMIT_MAX_REQUESTS,
   standardHeaders: true,
   legacyHeaders: false,
   // Scope by session cookie when present, falling back to IP.
   keyGenerator: (req) => req.sessionId ?? req.ip ?? 'unknown',
   message: { error: 'Too many requests. Please slow down.' },
});
