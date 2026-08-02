import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { SESSION_COOKIE_NAME } from '../config';

declare global {
   namespace Express {
      interface Request {
         sessionId: string;
      }
   }
}

export function sessionMiddleware(
   req: Request,
   res: Response,
   next: NextFunction
) {
   let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

   if (!sessionId || typeof sessionId !== 'string') {
      sessionId = crypto.randomUUID();
      res.cookie(SESSION_COOKIE_NAME, sessionId, {
         httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production',
         maxAge: 1000 * 60 * 60 * 24 * 7,
      });
   }

   req.sessionId = sessionId;
   next();
}
