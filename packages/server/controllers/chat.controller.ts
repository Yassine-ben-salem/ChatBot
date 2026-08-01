import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';

const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required')
      .max(1000, 'Prompt must be less than 1000 characters'),
   conversationId: z.uuid(),
});

export const chatController = {
   async sendMessage(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);

      if (!parseResult.success) {
         res.status(400).json(parseResult.error.format());
         return;
      }

      try {
         const { prompt, conversationId } = parseResult.data;
         const chatResponse = await chatService.sendMessage(
            req.sessionId,
            conversationId,
            prompt
         );

         res.json({ response: chatResponse.message });
      } catch (error) {
         console.error('Failed to generate chat response:', error);
         res.status(500).json({ error: 'Failed to generate a response.' });
      }
   },

   async streamMessage(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);

      if (!parseResult.success) {
         res.status(400).json(parseResult.error.format());
         return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
         const { prompt, conversationId } = parseResult.data;
         for await (const chunk of chatService.streamMessage(
            req.sessionId,
            conversationId,
            prompt
         )) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
         }
         res.write('data: [DONE]\n\n');
         res.end();
      } catch (error) {
         console.error('Failed to stream chat response:', error);
         res.status(500).end();
      }
   },
};
