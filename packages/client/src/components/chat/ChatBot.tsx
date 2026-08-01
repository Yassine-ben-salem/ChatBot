import { useRef, useState } from 'react';
import axios from 'axios';
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
         let buffer = '';
         let lastLength = 0;
         let revealStarted = false;

         const parseChunk = (newText: string) => {
            buffer += newText;
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
                     if (!revealStarted) {
                        revealStarted = true;
                        startRevealing();
                     }
                  }
               } catch {
                  // ignore malformed events
               }
            }
         };

         await axios.post(
            '/api/chat/stream',
            { prompt, conversationId: conversationId.current },
            {
               withCredentials: true,
               responseType: 'text',
               onDownloadProgress: (progressEvent) => {
                  const target = progressEvent.event?.target as
                     XMLHttpRequest | undefined;
                  const responseText: string = target?.responseText ?? '';
                  const newText = responseText.slice(lastLength);
                  lastLength = responseText.length;
                  if (newText) parseChunk(newText);
               },
            }
         );

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
