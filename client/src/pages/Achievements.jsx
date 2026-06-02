import { Award, Star, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const badgeIcons = {
  gold: { icon: Trophy, bg: "bg-accent-50", text: "text-accent-600", ring: "ring-accent-200" },
  silver: { icon: Award, bg: "bg-surface-100", text: "text-surface-600", ring: "ring-surface-300" },
  bronze: { icon: Star, bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  default: { icon: Zap, bg: "bg-brand-50", text: "text-brand-600", ring: "ring-brand-200" },
};

function getBadgeStyle(points) {
  if (points >= 100) return badgeIcons.gold;
  if (points >= 50) return badgeIcons.silver;
  if (points >= 25) return badgeIcons.bronze;
  return badgeIcons.default;
}

export default function Achievements() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/achievements")
      .then(setItems)
      .catch(() => toast.error("Failed to load achievements"))
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = items.reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Track badges, milestones, and recognition</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Badges</span>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-accent-500" />
            <strong className="text-2xl font-bold text-surface-900">{items.length}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Points</span>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-brand-500" />
            <strong className="text-2xl font-bold text-surface-900">{totalPoints.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Avg Points</span>
          <strong className="text-2xl font-bold text-surface-900">
            {items.length ? Math.round(totalPoints / items.length) : 0}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          description="Achievements will appear here as members participate in events and activities."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const style = getBadgeStyle(item.points);
            const Icon = style.icon;
            return (
              <article key={item._id} className="card-padded flex flex-col gap-4 hover:shadow-soft transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} ring-1 ${style.ring} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-surface-900">{item.badge}</h3>
                    <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-2xs font-bold">
                      {(item.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-surface-600">{item.user?.name || "Unknown"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-bold ring-1 ring-inset ring-accent-200">
                    <Zap size={12} />
                    {item.points} pts
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
