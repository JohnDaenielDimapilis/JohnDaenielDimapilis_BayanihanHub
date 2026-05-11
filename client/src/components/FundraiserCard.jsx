import { Link } from "react-router-dom";

import { formatCurrency, formatDate } from "../utils/formatDate";
import StatusBadge from "./StatusBadge";

export default function FundraiserCard({ fundraiser, showDonate = false }) {
  const progress = Math.min(
    100,
    Math.round(((fundraiser.currentAmount || 0) / Math.max(fundraiser.targetAmount || 1, 1)) * 100)
  );

  return (
    <article className="card flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-extrabold text-bayani-ink">{fundraiser.campaignTitle}</h3>
        <StatusBadge status={fundraiser.status} />
      </div>
      <p className="flex-1 text-sm leading-6 text-slate-600">{fundraiser.description}</p>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
          <span>{formatCurrency(fundraiser.currentAmount)}</span>
          <span>{formatCurrency(fundraiser.targetAmount)}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-gradient-to-r from-bayani-green to-bayani-blue" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Ends {formatDate(fundraiser.endDate)}
        </p>
      </div>
      {showDonate ? (
        <Link className="btn-primary mt-6 w-full" to="/user/donate">
          Donate
        </Link>
      ) : null}
    </article>
  );
}
