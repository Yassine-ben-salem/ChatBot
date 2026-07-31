import { useRef, useState } from 'react';
import TypingIndicator from './TypingIndicator';
import type { Message } from './ChatMessages';
import ChatMessages from './ChatMessages';
import ChatInput, { type ChatFormData } from './ChatInput';

const REVEAL_CHARS = 2;
const REVEAL_INTERVAL_MS = 20;

const ChatBot = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isBotTyping, setIsBotTyping] = useState(false);
   const [error, setError] = useState('');
   const conversationId = useRef(crypto.randomUUID());

   const updateBotMessage = (id: string, content: string) => {
      setMessages((prev) =>
         prev.map((message) =>
            message.id === id ? { ...message, content } : message
         )
      );
   };

   const onSubmit = async ({ prompt }: ChatFormData) => {
      const botMessageId = crypto.randomUUID();

      setMessages((prev) => [
         ...prev,
         { id: crypto.randomUUID(), content: prompt, role: 'user' },
         { id: botMessageId, content: '', role: 'bot' },
      ]);
      setIsBotTyping(true);
      setError('');

      let full = '';
      let displayed = 0;
      let streamDone = false;
      let revealTimer: ReturnType<typeof setInterval> | null = null;

      const stopRevealing = () => {
         if (revealTimer) {
            clearInterval(revealTimer);
            revealTimer = null;
         }
      };

      const startRevealing = () => {
         revealTimer = setInterval(() => {
            if (displayed >= full.length) {
               if (streamDone) {
                  stopRevealing();
               }
               return;
            }
            displayed = Math.min(displayed + REVEAL_CHARS, full.length);
            updateBotMessage(botMessageId, full.slice(0, displayed));
         }, REVEAL_INTERVAL_MS);
      };

      try {
         const response = await fetch('api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               prompt,
               conversationId: conversationId.current,
            }),
         });

         if (!response.ok || !response.body) {
            throw new Error('Failed to start the stream.');
         }

         const reader = response.body.getReader();
         const decoder = new TextDecoder();
         let buffer = '';

         startRevealing();

         while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() ?? '';

            for (const event of events) {
               const line = event.trim();
               if (!line.startsWith('data: ')) continue;

               const data = line.slice(6);
               if (data === '[DONE]') continue;

               try {
                  const { text } = JSON.parse(data);
                  if (text) {
                     full += text;
                  }
               } catch {
                  // ignore malformed events
               }
            }
         }

         streamDone = true;
         if (!full) {
            stopRevealing();
            updateBotMessage(botMessageId, 'No content');
         }
      } catch (error) {
         console.error(error);
         stopRevealing();
         setError('An error occurred while sending the message.');
         setMessages((prev) =>
            prev.filter((message) => message.id !== botMessageId)
         );
      } finally {
         setIsBotTyping(false);
      }
   };

   const lastMessage = messages[messages.length - 1];
   const isWaitingForResponse =
      isBotTyping && lastMessage?.role === 'bot' && lastMessage.content === '';

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
            <ChatMessages messages={messages} />
            {isWaitingForResponse && <TypingIndicator />}
            {error && <p className="text-red-500">{error}</p>}
         </div>
         <ChatInput onSubmit={onSubmit} disabled={isBotTyping} />
      </div>
   );
};

export default ChatBot;
