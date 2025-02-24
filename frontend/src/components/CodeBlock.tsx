import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { darcula } from "@uiw/codemirror-theme-darcula";
import { cn } from "@/lib/utils";
import { Database, Server } from "./AppSidebar";
import { useMemo, useState } from "react";
import { format } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { ChartNoAxesGanttIcon, PlayIcon } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface CodeBlockProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  server: Server;
  database: Database | null;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  affectedRows: number;
  executionTime: number;
  error?: string;
}

export function CodeBlock({
  value,
  onChange,
  className,
  server,
  database,
}: CodeBlockProps) {
  const [selection, setSelection] = useState<string>("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const handleEditorUpdate = (update: ViewUpdate) => {
    const state = update.view.state;
    const ranges = state.selection.ranges;
    if (ranges.length > 0 && ranges[0].from !== ranges[0].to) {
      const selectedText = state.doc.sliceString(ranges[0].from, ranges[0].to);
      debouncedSetSelection(selectedText);
    } else {
      debouncedSetSelection("");
    }
  };

  const formatSql = () => {
    try {
      const formatted = format(value, {
        language: "sql",
        indentStyle: "standard",
      });
      onChange(formatted);
    } catch (error) {
      console.error("SQL formatting error:", error);
    }
  };

  const executeQuery = async () => {
    if (!server && !database) return;
    const queryToExecute = selection;
    if (!queryToExecute) return;

    const connStr = `postgres://${server.user}:${server.password}@${
      server.host
    }:${server.port}/${database!.name}`;
    try {
      const response = await fetch("http://localhost:8080/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString: connStr,
          query: queryToExecute,
        }),
      });
      const result = await response.json();
      setResult(result);
    } catch (error: any) {
      setResult({
        columns: [],
        rows: [],
        affectedRows: 0,
        executionTime: 0,
        error: error.message,
      });
    }
  };

  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  const debouncedSetSelection = debounce(setSelection, 100);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const rowNumCol: ColumnDef<any> = {
      id: "rowNumber",
      header: "#",
      accessorKey: "rowNumber",
    };
    const dataCols =
      result?.columns?.map((colName) => ({
        accessorKey: colName,
        header: colName,
      })) || [];
    return [rowNumCol, ...dataCols];
  }, [result?.columns]);

  const transformedData = useMemo(() => {
    if (!result?.rows || !result?.columns) return [];
    return result.rows?.map((row, index) => {
      const rowObj: { [key: string]: any } = { rowNumber: index + 1 }; // Add row number
      result.columns.forEach((colName, colIndex) => {
        rowObj[colName] = row[colIndex];
      });
      return rowObj;
    });
  }, [result?.rows, result?.columns]);

  const table = useReactTable({
    data: transformedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn("flex flex-col h-full gap-2", className)}>
      <div className="flex items-center gap-2 p-2 bg-popover rounded-tl-md rounded-tr-md">
        <Button variant="secondary" size="sm" onClick={formatSql}>
          <ChartNoAxesGanttIcon /> Format
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={executeQuery}
          disabled={!selection}
        >
          <PlayIcon /> Execute
        </Button>
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[sql()]}
        theme={darcula}
        className={cn(
          "text-sm",
          "overflow-auto",
          "h-[50%]",
          "max-h-[40rem]",
          className
        )}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
        }}
        onUpdate={handleEditorUpdate}
      />
      <div className="scrollbar flex-1 overflow-auto rounded-b-md w-full">
        {result ? (
          result.error ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          ) : result.columns ? (
            <div className="text-muted-foreground">
              Query executed successfully
              <div className="text-muted-foreground mb-2 h-5 flex flex-row gap-2">
                <div>Execution time: {result.executionTime.toFixed(4)} ms</div>
                <Separator orientation="vertical" />
                <div>Total rows: {result.affectedRows}</div>
              </div>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Query executed successfully
              <div className="text-muted-foreground mb-2 h-5 flex flex-row gap-2">
                <div>Execution time: {result.executionTime.toFixed(4)} ms</div>
                <Separator orientation="vertical" />
                <div>Affected rows: {result.affectedRows}</div>
              </div>
            </div>
          )
        ) : (
          <div className="text-muted-foreground p-4">
            Run a query to see results here.
          </div>
        )}
      </div>
    </div>
  );
}
