import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { darcula } from "@uiw/codemirror-theme-darcula";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CodeBlock({ value, onChange, className }: CodeBlockProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={[sql()]}
      theme={darcula}
      className={cn("h-[calc(100vh-200px)]", "text-lg", className)}
      height="100%"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
      }}
    />
  );
}
