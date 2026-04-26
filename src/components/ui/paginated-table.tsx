import * as React from "react";
import { Button } from "@/components/ui/button";

export type PaginatedTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export type PaginatedTableProps<T> = {
  title?: React.ReactNode;
  columns: ReadonlyArray<PaginatedTableColumn<T>>;
  rows: ReadonlyArray<T>;
  getRowKey: (row: T, index: number) => string | number;
  emptyText?: React.ReactNode;

  limit: number;
  offset: number;
  hasNextPage: boolean;
  isLoading?: boolean;
  onOffsetChange: (nextOffset: number) => void;
};

export function PaginatedTable<T>({
  title,
  columns,
  rows,
  getRowKey,
  emptyText = "No results.",
  limit,
  offset,
  hasNextPage,
  isLoading,
  onOffsetChange,
}: PaginatedTableProps<T>) {
  const page = Math.floor(offset / Math.max(1, limit)) + 1;

  return (
    <section className="rounded-xl border border-border bg-bg-card shadow-sm">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading…</div>
          ) : null}
        </div>
      ) : null}

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-primary/10 dark:bg-muted/40">
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                    c.className ?? ""
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  className="border-b border-border last:border-b-0"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-sm text-foreground align-top ${
                        c.className ?? ""
                      }`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="text-xs text-muted-foreground">
          Page {page}
          {rows.length > 0 ? (
            <>
              {" "}
              • Showing {offset + 1}–{offset + rows.length}
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9"
            disabled={isLoading || offset <= 0}
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            className="h-9"
            disabled={isLoading || !hasNextPage}
            onClick={() => onOffsetChange(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

