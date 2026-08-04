import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { chatController } from './controllers/chat.controller';
import { chatRateLimiter } from './middleware/rateLimit';

const prisma = new PrismaClient();

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Hello, World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello, World!' });
});

router.post('/api/chat', chatRateLimiter, chatController.sendMessage);
router.post('/api/chat/stream', chatRateLimiter, chatController.streamMessage);

router.get('/api/products/:id/reviews', async (req: Request, res: Response) => {
   const productId = Number(req.params.id);

   if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
   }

   const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
   });

   res.json(reviews);
});

export default router;
