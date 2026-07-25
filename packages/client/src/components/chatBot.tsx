import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { FaArrowUp } from 'react-icons/fa';

type FormData = {
   prompt: string;
};

const ChatBot = () => {
   const { register, handleSubmit, reset, formState } = useForm<FormData>();

   const onSubmit = (data: FormData) => {
      console.log(data);
      reset();
   };

   const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSubmit(onSubmit)();
      }
   };

   return (
      <form
         onSubmit={handleSubmit(onSubmit)}
         onKeyDown={onKeyDown}
         className="flex flex-col gap-2 items-end border-2 rounded-3xl p-4 "
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
         <Button disabled={!formState.isValid} className="rounded-full h-9 w-9">
            <FaArrowUp />
         </Button>
      </form>
   );
};

export default ChatBot;
