import { Award, CheckCircle, HandCoins, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";
import FormField from "../components/ui/FormField.jsx";
import Modal from "../components/ui/Modal.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const badgeStyles = {
  "Level 5": { icon: Trophy, bg: "bg-accent-50", text: "text-accent-600", ring: "ring-accent-200" },
  "Level 4": { icon: Award, bg: "bg-info-50", text: "text-info-600", ring: "ring-info-200" },
  "Level 3": { icon: CheckCircle, bg: "bg-success-50", text: "text-success-600", ring: "ring-success-200" },
  default: { icon: Award, bg: "bg-brand-50", text: "text-brand-600", ring: "ring-brand-200" },
};

function badgeStyleFor(item) {
  const label = `${item.donationBadge || ""} ${item.eventBadge || ""}`;
  if (label.includes("Level 5")) return badgeStyles["Level 5"];
  if (label.includes("Level 4")) return badgeStyles["Level 4"];
  if (label.includes("Level 3")) return badgeStyles["Level 3"];
  return badgeStyles.default;
}

function peso(value) {
  return `PHP ${Number(value || 0).toLocaleString()}`;
}

const achievementRuleTemplates = [
  {
    id: "donation-level-1",
    name: "Donation Helper Level 1",
    category: "Donation",
    requirements: "1 verified donation or PHP 500 total verified support",
    level: "Level 1",
    description: "Entry badge for members who begin supporting fundraisers.",
    status: "Active"
  },
  {
    id: "donation-level-3",
    name: "Donation Champion Level 3",
    category: "Donation",
    requirements: "5 verified donations or PHP 5,000 total verified support",
    level: "Level 3",
    description: "Recognizes consistent fundraiser support.",
    status: "Active"
  },
  {
    id: "event-level-1",
    name: "Community Volunteer Level 1",
    category: "Event",
    requirements: "1 joined event with verified present attendance",
    level: "Level 1",
    description: "Entry badge for confirmed event participation.",
    status: "Active"
  },
  {
    id: "event-level-5",
    name: "Bayanihan Leader Level 5",
    category: "Event",
    requirements: "10 finished events with verified present attendance",
    level: "Level 5",
    description: "Top recognition for dependable community service.",
    status: "Active"
  }
];

export default function Achievements() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState(achievementRuleTemplates);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    if (user.role === "Admin") {
      setLoading(false);
      return;
    }
    api("/achievements")
      .then((data) => setItems(Array.isArray(data) ? data : data ? [data] : []))
      .catch(() => toast.error("Failed to load achievements"))
      .finally(() => setLoading(false));
  }, [user.role]);

  const totalBadges = items.reduce((sum, a) => sum + (a.badges?.length || 0), 0);
  const totalDonated = items.reduce((sum, a) => sum + Number(a.totalDonationAmount || 0), 0);
  const totalEventsJoined = items.reduce((sum, a) => sum + Number(a.totalEventsJoined || 0), 0);
  const totalCompleted = items.reduce((sum, a) => sum + Number(a.totalCompletedAttendedEvents || 0), 0);

  function saveRule() {
    setRules((current) => current.map((rule) => rule.id === editingRule.id ? editingRule : rule));
    setEditingRule(null);
    toast.success("Achievement rule updated");
  }

  if (user.role === "Admin") {
    return (
      <section className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1>Achievements</h1>
          <p>Manage achievement types, rules, levels, and visibility status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card-component">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Rule Types</span>
            <strong className="text-2xl font-bold text-surface-900">{rules.length}</strong>
          </div>
          <div className="stat-card-component">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Active</span>
            <strong className="text-2xl font-bold text-success-600">{rules.filter((rule) => rule.status === "Active").length}</strong>
          </div>
          <div className="stat-card-component">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Categories</span>
            <strong className="text-2xl font-bold text-surface-900">{new Set(rules.map((rule) => rule.category)).size}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <article key={rule.id} className="card-padded space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-surface-900 break-words">{rule.name}</h2>
                  <p className="text-sm text-surface-500">{rule.category} - {rule.level}</p>
                </div>
                <span className={rule.status === "Active" ? "badge badge-success" : "badge badge-neutral"}>{rule.status}</span>
              </div>
              <div className="space-y-2 text-sm text-surface-700">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Requirements</p>
                  <p>{rule.requirements}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Description</p>
                  <p>{rule.description}</p>
                </div>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditingRule({ ...rule })}>Edit Rule</button>
            </article>
          ))}
        </div>

        <Modal open={!!editingRule} onClose={() => setEditingRule(null)} title="Edit Achievement Rule">
          {editingRule && (
            <div className="space-y-4">
              <div className="form-grid">
                <FormField label="Achievement Name">
                  <input className="input" value={editingRule.name} onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })} />
                </FormField>
                <FormField label="Category">
                  <select className="input" value={editingRule.category} onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}>
                    <option>Donation</option>
                    <option>Event</option>
                    <option>Hybrid</option>
                  </select>
                </FormField>
                <FormField label="Level">
                  <select className="input" value={editingRule.level} onChange={(e) => setEditingRule({ ...editingRule, level: e.target.value })}>
                    <option>Level 1</option>
                    <option>Level 2</option>
                    <option>Level 3</option>
                    <option>Level 4</option>
                    <option>Level 5</option>
                  </select>
                </FormField>
                <FormField label="Status">
                  <select className="input" value={editingRule.status} onChange={(e) => setEditingRule({ ...editingRule, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Requirements">
                <textarea className="input" value={editingRule.requirements} onChange={(e) => setEditingRule({ ...editingRule, requirements: e.target.value })} />
              </FormField>
              <FormField label="Description">
                <textarea className="input" value={editingRule.description} onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })} />
              </FormField>
              <div className="flex justify-end gap-3">
                <button className="btn-outline" onClick={() => setEditingRule(null)}>Cancel</button>
                <button className="btn-primary" onClick={saveRule}>Save Changes</button>
              </div>
            </div>
          )}
        </Modal>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Track donation and helper milestones from verified totals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Badges</span>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-accent-500" />
            <strong className="text-2xl font-bold text-surface-900">{totalBadges}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Donated</span>
          <div className="flex items-center gap-2">
            <HandCoins size={18} className="text-success-500" />
            <strong className="text-2xl font-bold text-surface-900">{peso(totalDonated)}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Events Joined</span>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-info-500" />
            <strong className="text-2xl font-bold text-surface-900">{totalEventsJoined}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Completed Attended</span>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-brand-500" />
            <strong className="text-2xl font-bold text-surface-900">{totalCompleted}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          description="Achievements will appear here as members join events and make verified donations."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const style = badgeStyleFor(item);
            const Icon = style.icon;
            const badges = item.badges?.length ? item.badges : ["No milestone badge yet"];
            const owner = item.userId || item.user || (user.role === "User" ? user : null);
            return (
              <article key={item._id} className="card-padded flex flex-col gap-4 hover:shadow-soft transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} ring-1 ${style.ring} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-surface-900">{owner?.name || "My Achievement"}</h3>
                    <p className="text-sm text-surface-500 mt-0.5">
                      {peso(item.totalDonationAmount)} donated, {item.totalEventsJoined || 0} events joined
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {badges.map((badge) => <span key={badge} className="badge badge-info">{badge}</span>)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-100 text-sm">
                  <div>
                    <p className="text-2xs uppercase font-semibold text-surface-400">Donation Badge</p>
                    <p className="font-medium text-surface-800">{item.donationBadge || "None yet"}</p>
                  </div>
                  <div>
                    <p className="text-2xs uppercase font-semibold text-surface-400">Event Badge</p>
                    <p className="font-medium text-surface-800">{item.eventBadge || "None yet"}</p>
                  </div>
                  <div>
                    <p className="text-2xs uppercase font-semibold text-surface-400">Verified Donations</p>
                    <p className="font-medium text-surface-800">{item.totalDonations || 0}</p>
                  </div>
                  <div>
                    <p className="text-2xs uppercase font-semibold text-surface-400">Attended Finished</p>
                    <p className="font-medium text-surface-800">{item.totalCompletedAttendedEvents || 0}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
