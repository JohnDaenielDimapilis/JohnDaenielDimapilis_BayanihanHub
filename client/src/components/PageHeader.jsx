export default function PageHeader({ actions, eyebrow, subtitle, title }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.25em] text-bayani-green">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-bayani-ink md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
