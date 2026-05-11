const logoSizes = {
  header: "h-14 max-w-[220px]",
  sidebar: "h-16 max-w-[230px]"
};

export default function BrandLogo({ size = "header" }) {
  return (
    <span className="inline-flex items-center">
      <span className="inline-flex rounded-2xl bg-white/95 p-1.5 shadow-soft ring-1 ring-slate-100">
        <img
          alt=""
          className={`${logoSizes[size] || logoSizes.header} w-auto object-contain`}
          decoding="async"
          src="/bayanihan-hub-logo.png"
        />
      </span>
      <span className="sr-only">BayanihanHub</span>
    </span>
  );
}
