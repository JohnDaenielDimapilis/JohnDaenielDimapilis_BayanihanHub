import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "./ui/EmptyState.jsx";

export default function DataTable({
  data = [],
  columns = [],
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize: initialPageSize = 10,
  onRowClick,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  exportFilename,
  actions,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? (typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]) : "";
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = typeof col.accessor === "function" ? col.accessor(a) : a[col.accessor];
      const bVal = typeof col.accessor === "function" ? col.accessor(b) : b[col.accessor];
      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();
      const numA = Number(aVal);
      const numB = Number(bVal);
      let cmp;
      if (!isNaN(numA) && !isNaN(numB)) {
        cmp = numA - numB;
      } else {
        cmp = aStr.localeCompare(bStr);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function exportCSV() {
    const headers = columns.map((c) => c.header).join(",");
    const rows = sorted.map((row) =>
      columns.map((col) => {
        const val = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
        const str = String(val ?? "").replace(/"/g, '""');
        return `"${str}"`;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="card overflow-hidden animate-pulse">
        <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
          <div className="skeleton h-9 w-64 rounded-lg" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-surface-100">
            {columns.map((_, j) => (
              <div key={j} className="skeleton h-4 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {(searchable || exportFilename || actions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-surface-200 bg-surface-50/50">
          {searchable && (
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                className="input pl-9 pr-8 h-9"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-200" aria-label="Clear search">
                  <X size={14} className="text-surface-400" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {actions}
            {exportFilename && (
              <button onClick={exportCSV} className="btn-outline btn-sm" title="Export CSV">
                <Download size={14} />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {paged.length === 0 ? (
        <EmptyState
          icon={search ? "search" : "empty"}
          title={search ? "No results found" : emptyTitle}
          description={search ? `No records match "${search}". Try a different search.` : emptyDescription}
          className="py-12"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider ${col.sortable !== false ? "cursor-pointer select-none hover:text-surface-700 transition-colors" : ""} ${col.className || ""}`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={col.sortable !== false ? () => toggleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && (
                        sortKey === col.key
                          ? (sortDir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />)
                          : <ArrowUpDown size={13} className="opacity-30" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr
                  key={row._id || row.id || i}
                  className={`border-b border-surface-100 last:border-0 transition-colors hover:bg-surface-50/80 ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 text-surface-700 ${col.className || ""}`}>
                      {col.render ? col.render(row) : (typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-surface-200 bg-surface-50/50">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span>Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
            {filtered.length !== data.length && <span className="text-surface-400">({data.length} total)</span>}
            <select
              className="input h-7 w-auto text-xs px-2"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="btn-ghost btn-xs" disabled={page === 0} onClick={() => setPage(0)} aria-label="First page">&laquo;</button>
            <button className="btn-ghost btn-xs" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`btn-xs min-w-[28px] ${page === pageNum ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button className="btn-ghost btn-xs" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <ChevronRight size={14} />
            </button>
            <button className="btn-ghost btn-xs" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} aria-label="Last page">&raquo;</button>
          </div>
        </div>
      )}
    </div>
  );
}
