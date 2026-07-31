export type ChatMessage = {
   role: 'system' | 'user' | 'assistant';
   content: string;
};

const conversations = new Map<string, ChatMessage[]>();

export const conversationRepository = {
   getMessages(conversationId: string): ChatMessage[] {
      return [...(conversations.get(conversationId) ?? [])];
   },
   addMessage(conversationId: string, message: ChatMessage): ChatMessage[] {
      const history = conversations.get(conversationId) ?? [];
      history.push(message);
      conversations.set(conversationId, history);
      return [...history];
   },
};
