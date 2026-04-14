import type { ReactNode } from "react";
import EmptyState from "@/components/EmptyState";

export interface StatColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
}

interface StatTableProps<T> {
  rows: T[];
  columns: StatColumn<T>[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
}

function alignClass(align: StatColumn<unknown>["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function display(value: ReactNode) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

export default function StatTable<T>({
  rows,
  columns,
  rowKey,
  emptyMessage
}: StatTableProps<T>) {
  if (!rows.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-line bg-white shadow-soft">
      <table className="min-w-[560px] border-collapse text-xs sm:min-w-full sm:text-sm">
        <thead className="bg-ink text-white">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-3 py-2 font-bold sm:px-4 sm:py-3 ${alignClass(column.align)}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="border-t border-line odd:bg-paper">
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2 text-ink sm:px-4 sm:py-3 ${alignClass(column.align)}`}>
                  {display(column.render(row))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
