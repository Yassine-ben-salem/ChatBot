import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controller';
import { chatRateLimiter } from './middleware/rateLimit';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Hello, World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello, World!' });
});

router.post('/api/chat', chatRateLimiter, chatController.sendMessage);
router.post('/api/chat/stream', chatRateLimiter, chatController.streamMessage);

export default router;
