import OpenAI from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

type chatResponse = {
    id: string;
    message: string;
};

export const chatService = {
    async sendMessage(conversationId: string, prompt: string): Promise<chatResponse> {
        const history = conversationRepository.getMessages(conversationId);

        const response = await client.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                ...history,
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.2,
            max_tokens: 2048,
        }) as any;

        const assistantMessage = response.choices?.[0]?.message?.content ?? 'No content';

        conversationRepository.addMessage(conversationId, {
            role: 'user',
            content: prompt,
        });
        conversationRepository.addMessage(conversationId, {
            role: 'assistant',
            content: assistantMessage,
        });

        return {
            id: response.id,
            message: assistantMessage,
        };
    },
};