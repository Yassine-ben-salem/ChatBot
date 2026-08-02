import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../prompts/chatBot.txt';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
   throw new Error(
      'OPENAI_API_KEY is not set. Copy packages/server/.env.example to packages/server/.env and set a valid key.'
   );
}

const client = new OpenAI({
   apiKey,
   baseURL: 'https://openrouter.ai/api/v1',
});

const parkInfo = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', 'WonderWorld.md'),
   'utf-8'
);
const instructions = template.replace('{{parkInfo}}', parkInfo);

type ChatResponse = {
   id: string;
   message: string;
};

type ContentPart = {
   text?: string;
};

function normalizeContent(
   content: string | Array<ContentPart> | null | undefined
): string {
   if (typeof content === 'string' && content) {
      return content;
   }
   if (Array.isArray(content)) {
      const text = content.map((part) => part?.text ?? '').join('');
      return text || 'No content';
   }
   return 'No content';
}

export const chatService = {
   async sendMessage(
      sessionId: string,
      conversationId: string,
      prompt: string
   ): Promise<ChatResponse> {
      conversationRepository.addMessage(sessionId, conversationId, {
         role: 'user',
         content: prompt,
      });

      const history = conversationRepository.getMessages(
         sessionId,
         conversationId
      );

      const response = await client.chat.completions.create({
         model: 'openai/gpt-5.4-mini',
         messages: [{ role: 'system', content: instructions }, ...history],
         temperature: 0.2,
         max_tokens: 2048,
      });

      const assistantMessage = normalizeContent(
         response.choices?.[0]?.message?.content
      );

      conversationRepository.addMessage(sessionId, conversationId, {
         role: 'assistant',
         content: assistantMessage,
      });

      return {
         id: response.id,
         message: assistantMessage,
      };
   },

   async *streamMessage(
      sessionId: string,
      conversationId: string,
      prompt: string
   ): AsyncGenerator<string> {
      conversationRepository.addMessage(sessionId, conversationId, {
         role: 'user',
         content: prompt,
      });

      const history = conversationRepository.getMessages(
         sessionId,
         conversationId
      );

      const stream = await client.chat.completions.create({
         model: 'openai/gpt-5.4-mini',
         messages: [{ role: 'system', content: instructions }, ...history],
         temperature: 0.2,
         max_tokens: 2048,
         stream: true,
      });

      let full = '';
      for await (const chunk of stream) {
         const text = chunk.choices?.[0]?.delta?.content ?? '';
         if (text) {
            full += text;
            yield text;
         }
      }

      conversationRepository.addMessage(sessionId, conversationId, {
         role: 'assistant',
         content: full || 'No content',
      });
   },
};
