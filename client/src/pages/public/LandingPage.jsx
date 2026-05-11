import { ArrowRight, BadgeCheck, BarChart3, CalendarCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: CalendarCheck,
    title: "Event Management",
    text: "Create, monitor, approve, and publish foundation events with participant tracking."
  },
  {
    icon: HeartHandshake,
    title: "Fundraising",
    text: "Manage campaigns, donation records, and donor activity from one accountable workspace."
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    text: "Admin, Staff, and User portals keep sensitive workflows protected and traceable."
  },
  {
    icon: BarChart3,
    title: "Reports and Logs",
    text: "Dashboards, activity logs, feedback, and reports support better foundation decisions."
  }
];

export default function LandingPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-bayani-green shadow-soft">
          <BadgeCheck size={17} />
          Centralized foundation management
        </span>
        <h1 className="mt-7 font-display text-5xl font-extrabold tracking-tight text-bayani-ink md:text-7xl">
          Bayanihan work, organized with care.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          BayanihanHub is a full-stack event and fundraising management system for foundations that need dependable
          approvals, clear participation records, donation tracking, feedback, achievements, and accountable reports.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary gap-2" to="/register">
            Start now <ArrowRight size={18} />
          </Link>
          <Link className="btn-secondary" to="/about">
            View proposal scope
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-bayani-warm/20 blur-3xl" />
        <div className="absolute -bottom-10 right-4 h-44 w-44 rounded-full bg-bayani-blue/20 blur-3xl" />
        <div className="relative rounded-[2rem] border border-white bg-white/70 p-4 shadow-soft backdrop-blur">
          <div className="rounded-[1.5rem] bg-bayani-ink p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Live Control Room</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Total Events", "36"],
                ["Pending Reviews", "8"],
                ["Donation Records", "₱842K"],
                ["Active Volunteers", "512"]
              ].map(([label, value]) => (
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10" key={label}>
                  <p className="text-sm text-blue-100">{label}</p>
                  <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-gradient-to-r from-bayani-green to-bayani-blue p-5">
              <p className="font-display text-xl font-extrabold">Approval workflow</p>
              <p className="mt-2 text-sm leading-6 text-blue-50">
                Staff submit events and campaigns. Admin approval makes them visible to volunteers and donors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:col-span-2 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article className="card" key={feature.title}>
            <feature.icon className="mb-5 text-bayani-blue" size={28} />
            <h2 className="font-display text-lg font-extrabold text-bayani-ink">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
