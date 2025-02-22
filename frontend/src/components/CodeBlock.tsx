import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CodeBlock({ value, onChange, className }: CodeBlockProps) {
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const updateLineCount = () => {
    const lines = value.split("\n").length;
    setLineCount(lines);
  };

  useEffect(() => {
    updateLineCount();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join(
    "\n"
  );

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop; // Sync scrolling
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-[calc(100vh-200px)] bg-secondary rounded-md",
        className
      )}
    >
      <pre
        ref={preRef}
        className="text-gray-400 text-md font-mono p-2 w-12 text-right select-none bg-secondary rounded-md overflow-hidden"
      >
        {lineNumbers}
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        className="flex-1 p-2 text-gray-100 bg-secondary font-mono text-md border-none outline-none resize-none h-full overflow-y-auto overflow-x-auto whitespace-pre rounded-md scrollbar"
        spellCheck={false}
        placeholder="Enter SQL here..."
      />
    </div>
  );
}
