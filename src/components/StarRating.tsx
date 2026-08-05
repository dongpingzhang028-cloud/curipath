export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const starSize = size === "md" ? "text-xl" : "text-sm";
  const numberSize = size === "md" ? "text-base" : "text-sm";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`relative inline-block ${starSize} leading-none tracking-tight text-slate-300`}
        aria-hidden
      >
        <span>★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-amber-500"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className={`font-medium text-slate-700 ${numberSize}`}>{rating.toFixed(1)}</span>
    </span>
  );
}
