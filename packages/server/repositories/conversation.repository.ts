import { MAX_HISTORY_MESSAGES } from '../config';

export type ChatMessage = {
   role: 'system' | 'user' | 'assistant';
   content: string;
};

const conversations = new Map<string, ChatMessage[]>();

function scopedKey(sessionId: string, conversationId: string): string {
   return `${sessionId}:${conversationId}`;
}

export const conversationRepository = {
   getMessages(sessionId: string, conversationId: string): ChatMessage[] {
      const key = scopedKey(sessionId, conversationId);
      return [...(conversations.get(key) ?? [])];
   },
   addMessage(
      sessionId: string,
      conversationId: string,
      message: ChatMessage
   ): ChatMessage[] {
      const key = scopedKey(sessionId, conversationId);
      const history = conversations.get(key) ?? [];
      history.push(message);
      // Cap stored history so memory usage and token cost can't grow unbounded.
      const trimmed =
         history.length > MAX_HISTORY_MESSAGES
            ? history.slice(history.length - MAX_HISTORY_MESSAGES)
            : history;
      conversations.set(key, trimmed);
      return [...trimmed];
   },
};
