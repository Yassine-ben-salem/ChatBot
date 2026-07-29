const typingIndicator = () => {
   return (
      <div className="flex gap-1 px-3 py-3 rounded-xl bg-gray-200 self-start">
         <Dot />
         <Dot className="[animation-delay:0.2s]" />
         <Dot className="[animation-delay:0.4s]" />
      </div>
   );
};

type DotProps = {
   className?: string;
};

const Dot = ({ className }: DotProps) => (
   <div
      className={`w-2 h-2 rounded-full bg-gray-800 animate-pulse ${className}`}
   ></div>
);

export default typingIndicator;
