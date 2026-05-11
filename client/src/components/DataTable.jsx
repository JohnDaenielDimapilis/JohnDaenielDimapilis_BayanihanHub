import StatusBadge from "./StatusBadge";

export default function DataTable({ columns, emptyMessage = "No records found.", rows }) {
  if (!rows?.length) {
    return <div className="card text-center text-sm font-semibold text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-4" key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="align-top transition hover:bg-bayani-mist/50" key={row._id || row.id}>
                {columns.map((column) => {
                  const value = column.render ? column.render(row) : row[column.key];
                  return (
                    <td className="px-5 py-4 text-slate-700" key={column.key}>
                      {column.key === "status" || column.key === "donationStatus" ? <StatusBadge status={value} /> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
