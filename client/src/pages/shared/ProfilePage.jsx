import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        subtitle="Your account details are protected by JWT authentication and role-based authorization."
        title="My Profile"
      />
      <section className="card max-w-3xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-bayani-blue to-bayani-green font-display text-3xl font-extrabold text-white">
            {user?.fullName?.slice(0, 2).toUpperCase() || "BH"}
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold text-bayani-ink">{user?.fullName}</h2>
            <p className="mt-2 text-slate-600">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={user?.status} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-sm font-bold text-slate-500">Account created</dt>
            <dd className="mt-2 font-display text-lg font-extrabold text-bayani-ink">{formatDate(user?.createdAt)}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-sm font-bold text-slate-500">Last updated</dt>
            <dd className="mt-2 font-display text-lg font-extrabold text-bayani-ink">{formatDate(user?.updatedAt)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
