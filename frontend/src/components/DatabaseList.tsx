import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

interface Database {
  name: string;
  owner: string;
  encoding: string;
}

interface DatabaseListProps {
  databases: Database[];
}

export function DatabaseList({ databases }: DatabaseListProps) {
  const columns: ColumnDef<Database>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "owner",
      header: "Owner",
    },
    {
      accessorKey: "encoding",
      header: "Encoding",
    },
  ];

  const table = useReactTable({
    data: databases,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border bg-gray-800 overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-100">
        <thead className="bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-medium text-gray-400"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-700 hover:bg-gray-700"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
