type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

const conversations = new Map<string, ChatMessage[]>();

export const conversationRepository = {
    getMessages(conversationId: string) {
        return conversations.get(conversationId) ?? [];
    },
    addMessage(conversationId: string, message: ChatMessage) {
        const history = conversations.get(conversationId) ?? [];
        history.push(message);
        conversations.set(conversationId, history);
        return history;
    },
    getLastResponseId(conversationId: string) {
        const history = conversations.get(conversationId) ?? [];
        return history[history.length - 1]?.content ?? null;
    },
    setLastResponseId(conversationId: string, responseId: string) {
        const history = conversations.get(conversationId) ?? [];
        const lastMessage = history[history.length - 1];

        if (lastMessage) {
            lastMessage.content = responseId;
        }

        conversations.set(conversationId, history);
        return history;
    }
};

