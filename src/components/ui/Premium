import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "blue" | "green" | "purple" | "orange" | "pink";
  inset?: boolean; // cabeçalho com faixa sutil
};

const toneMap = {
  blue:   { from: "from-blue-50",   to: "to-white",        ring: "ring-blue-200/60",   head: "bg-blue-100/80",  darkFrom: "from-slate-800",  darkTo: "to-slate-900",  darkRing: "ring-blue-700/50",  darkHead: "bg-slate-900/40" },
  green:  { from: "from-emerald-50",to: "to-white",        ring: "ring-emerald-200/60",head: "bg-emerald-100/80",darkFrom: "from-slate-800",  darkTo: "to-slate-900",  darkRing: "ring-emerald-700/50",darkHead: "bg-slate-900/40" },
  purple: { from: "from-violet-50", to: "to-white",        ring: "ring-violet-200/60", head: "bg-violet-100/80", darkFrom: "from-slate-800",  darkTo: "to-slate-900",  darkRing: "ring-violet-700/50", darkHead: "bg-slate-900/40" },
  orange: { from: "from-amber-50",  to: "to-white",        ring: "ring-amber-200/60",  head: "bg-amber-100/80",  darkFrom: "from-slate-800",  darkTo: "to-slate-900",  darkRing: "ring-amber-700/50",  darkHead: "bg-slate-900/40" },
  pink:   { from: "from-pink-50",   to: "to-white",        ring: "ring-pink-200/60",   head: "bg-pink-100/80",   darkFrom: "from-slate-800",  darkTo: "to-slate-900",  darkRing: "ring-pink-700/50",   darkHead: "bg-slate-900/40" },
};

export const PremiumCard: React.FC<React.PropsWithChildren<CardProps>> = ({ tone="blue", inset=false, className="", children, ...rest }) => {
  const t = toneMap[tone];
  return (
    <div
      {...rest}
      className={[
        // gradiente + borda luminosa
        `rounded-2xl shadow-lg ring-1 overflow-hidden`,
        `bg-gradient-to-br ${t.from} ${t.to} dark:${t.darkFrom} dark:${t.darkTo} ${t.ring} dark:${t.darkRing}`,
        className,
      ].join(" ")}
    >
      {inset ? (
        <div className={`${t.head} dark:${t.darkHead} px-5 py-3 border-b border-white/40 dark:border-white/10`}>
          {children instanceof Array ? children[0] : children}
        </div>
      ) : null}
      <div className={inset ? "px-5 py-4" : "p-5"}>{inset ? (children as any[]).slice(1) : children}</div>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; className?: string; }> = ({ title, subtitle, icon, className }) => (
  <div className={["flex items-center gap-3", className || ""].join(" ")}>
    {icon ? <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">{icon}</div> : null}
    <div>
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const BadgePill: React.FC<{ children: React.ReactNode; tone?: "blue"|"green"|"yellow"|"red"|"slate"; className?: string; }> = ({ children, tone="blue", className }) => {
  const toneCls = {
    blue:   "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800",
    green:  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
    yellow: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
    red:    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800",
    slate:  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800",
  }[tone];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${toneCls} ${className || ""}`} >{children}</span>;
};

export const AIGradient: React.FC<React.PropsWithChildren<{className?: string}>> = ({ children, className }) => (
  <div className={`relative ${className || ""}`}>
    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(1200px_400px_at_10%_-20%,rgba(99,102,241,.12),transparent),radial-gradient(900px_300px_at_110%_120%,rgba(16,185,129,.12),transparent)]" />
    <div className="relative">{children}</div>
  </div>
);
