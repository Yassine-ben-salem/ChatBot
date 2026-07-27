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
   const conversationId = useRef(crypto.randomUUID());
   const messagesEndRef = useRef<HTMLDivElement | null>(null);
   const { register, handleSubmit, reset, formState } = useForm<FormData>();

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const onSubmit = async ({ prompt }: FormData) => {
      setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
      setIsBotTyping(true);

      reset();

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

   return (
      <div className="flex h-[calc(100vh-2rem)] flex-col">
         <div className="flex-1 flex flex-col gap-2 mb-4 overflow-y-auto no-scrollbar">
            {messages.map((message, index) => (
               <p
                  key={index}
                  className={`px-3 py-1 rounded-xl ${
                     message.role === 'user'
                        ? 'bg-blue-600 text-white self-end'
                        : 'bg-gray-100 textt-black self-start'
                  }`}
               >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
               </p>
            ))}
            {isBotTyping && (
               <div className="flex gap-1 px-3 py-3 rounded-xl bg-gray-200 self-start">
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse "></div>
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.2s] "></div>
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.4s]"></div>
               </div>
            )}
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
