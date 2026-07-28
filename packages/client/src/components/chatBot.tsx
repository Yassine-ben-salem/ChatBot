import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { FaArrowUp } from 'react-icons/fa';

type FormData = {
   prompt: string;
};

type ChatResponse = {
   response: string;
};

type Message = {
   content: string;
   role: 'user' | 'bot';
};

const ChatBot = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isBotTyping, setIsBotTyping] = useState(false);
   const lastMessageRef = useRef<HTMLDivElement | null>(null);
   const conversationId = useRef(crypto.randomUUID());
   const { register, handleSubmit, reset, formState } = useForm<FormData>();

   useEffect(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const onSubmit = async ({ prompt }: FormData) => {
      setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
      setIsBotTyping(true);

      reset({ prompt: '' });

      const { data } = await axios.post<ChatResponse>('api/chat', {
         prompt,
         conversationId: conversationId.current,
      });
      setMessages((prev) => [...prev, { content: data.response, role: 'bot' }]);
      setIsBotTyping(false);
   };

   const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSubmit(onSubmit)();
      }
   };

   const onCopyMessage = (e: React.ClipboardEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
         e.preventDefault();
         e.clipboardData.setData('text/plain', selection);
      }
   };
   return (
      <div className="flex flex-col  h-full">
         <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto ">
            {messages.map((message, index) => {
               const content = message.content;

               return (
                  <div
                     key={index}
                     onCopy={onCopyMessage}
                     ref={index === messages.length - 1 ? lastMessageRef : null}
                     className={`px-3 py-1 rounded-xl wrap-break-word leading-tight  ${
                        message.role === 'user'
                           ? 'bg-blue-600 text-white self-end'
                           : 'bg-gray-100 text-black self-start'
                     }`}
                  >
                     <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
               );
            })}
            {isBotTyping && (
               <div className="flex gap-1 px-3 py-3 rounded-xl bg-gray-200 self-start">
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse "></div>
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.2s] "></div>
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.4s]"></div>
               </div>
            )}
            <div ref={lastMessageRef} />
         </div>
         <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={onKeyDown}
            className="sticky bottom-0 flex flex-col gap-2 items-end border-2 rounded-3xl p-4 bg-background"
         >
            <textarea
               {...register('prompt', {
                  required: true,
                  validate: (data) => data.trim().length > 0,
               })}
               autoFocus
               className="w-full border-0 focus:outline-0 resize-none overflow-hidden min-h-12"
               placeholder="Ask Anything"
               maxLength={1000}
            />
            <Button
               disabled={!formState.isValid}
               className="rounded-full h-9 w-9"
            >
               <FaArrowUp />
            </Button>
         </form>
      </div>
   );
};

export default ChatBot;
