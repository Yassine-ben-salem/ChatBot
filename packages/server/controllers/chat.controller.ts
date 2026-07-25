import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';


const chatSchema = z.object({
    prompt: z.string()
        .trim()
        .min(1, 'Prompt is required')
        .max(1000, 'Prompt must be less than 1000 characters'),
    conversationId: z.uuid(),
});

// Public Interface     

export const chatController = {
    async sendMessage(req: Request, res: Response) {
        const parseResult = chatSchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(400).json(parseResult.error.format());
        return;
    }

    try {
        const { prompt, conversationId } = parseResult.data;
        const chatResponse = await chatService.sendMessage(conversationId, prompt);

        res.json({ response: chatResponse.message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate a response.' });
    }
  }
}
