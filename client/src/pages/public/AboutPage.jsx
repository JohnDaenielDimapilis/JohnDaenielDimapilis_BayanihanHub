import PageHeader from "../../components/PageHeader";

const objectives = [
  "Develop role-based access for Admin, Staff, and User accounts.",
  "Provide event management with admin approval before publication.",
  "Record fundraising campaigns, donations, donor activity, and approval status.",
  "Track participation, feedback, and achievements during foundation operations.",
  "Integrate login logs, activity logs, approval logs, password protection, validation, and session controls."
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-10">
      <PageHeader
        eyebrow="System Proposal"
        subtitle="Based on BayanihanHub: A Centralized Foundation Event and Fundraising Management System."
        title="Built for transparent foundation operations"
      />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="card">
          <h2 className="font-display text-2xl font-extrabold text-bayani-ink">Executive Summary</h2>
          <p className="mt-4 leading-7 text-slate-600">
            BayanihanHub provides dashboards, forms, tables, reports, schedules, profile pages, and protected backend
            services for foundation work. Admin users approve events and fundraisers, Staff users manage operations, and
            User accounts join events, donate, submit feedback, and view achievements.
          </p>
        </article>
        <article className="card">
          <h2 className="font-display text-2xl font-extrabold text-bayani-ink">SMART Objectives</h2>
          <div className="mt-5 grid gap-3">
            {objectives.map((objective, index) => (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700" key={objective}>
                <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-full bg-bayani-blue text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                {objective}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
