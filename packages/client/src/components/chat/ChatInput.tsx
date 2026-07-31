import type { KeyboardEvent, MouseEvent } from 'react';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { FaArrowUp } from 'react-icons/fa';

export type ChatFormData = {
   prompt: string;
};

type Props = {
   onSubmit: (data: ChatFormData) => void;
   disabled?: boolean;
};

const ChatInput = ({ onSubmit, disabled = false }: Props) => {
   const { register, handleSubmit, reset, formState, setFocus } =
      useForm<ChatFormData>({
         defaultValues: { prompt: '' },
      });

   const submit = handleSubmit((data) => {
      if (disabled) return;
      reset({ prompt: '' });
      onSubmit(data);
   });

   const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         if (!disabled) {
            submit();
         }
      }
   };

   const handleClick = (e: MouseEvent<HTMLFormElement>) => {
      if (e.target instanceof Element && e.target.closest('button')) return;
      setFocus('prompt');
   };

   return (
      <form
         onSubmit={submit}
         onKeyDown={handleKeyDown}
         onClick={handleClick}
         className="sticky bottom-0 flex flex-col gap-2 items-end border-2 rounded-3xl p-4 bg-background cursor-text"
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
            disabled={disabled || !formState.isValid}
            className="rounded-full h-9 w-9 cursor-pointer disabled:pointer-events-auto disabled:cursor-pointer"
         >
            <FaArrowUp />
         </Button>
      </form>
   );
};

export default ChatInput;
