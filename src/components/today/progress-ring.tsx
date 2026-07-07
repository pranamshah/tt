export function ProgressRing({
  total,
  completed,
}: {
  total: number;
  completed: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const label =
    total === 0
      ? "Nothing due today"
      : pct === 100
        ? "All done"
        : pct >= 50
          ? "Progressing well"
          : "Just getting started";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-card p-3">
      <div className="relative flex size-16 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 64 64" aria-hidden>
          <circle
            className="text-surface-container-high"
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            className="text-primary transition-all duration-700"
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-mono text-xs font-bold text-on-surface">
          {pct}%
        </span>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          Completion rate
        </p>
        <p className="font-body text-sm font-bold text-on-surface">{label}</p>
      </div>
    </div>
  );
}
