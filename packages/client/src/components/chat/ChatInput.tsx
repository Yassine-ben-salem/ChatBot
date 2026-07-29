import { Button } from '@base-ui/react/button';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowUp } from 'react-icons/fa';

export type ChatFormData = {
   prompt: string;
};

type Props = {
   onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
   const { register, handleSubmit, reset, formState } = useForm<ChatFormData>({
      defaultValues: { prompt: '' },
   });

   const submit = handleSubmit((data) => {
      reset({ prompt: '' });
      onSubmit(data);
   });

   const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         submit();
      }
   };

   return (
      <form
         onSubmit={submit}
         onKeyDown={handleKeyDown}
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
            type="submit"
            disabled={!formState.isValid}
            className="rounded-full h-9 w-9"
         >
            <FaArrowUp />
         </Button>
      </form>
   );
};

export default ChatInput;
