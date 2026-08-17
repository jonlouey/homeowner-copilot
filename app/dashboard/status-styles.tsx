// Shared status-color styling per docs/designs/design-system.md's "Status
// pill" pattern — one shape, the color trio swaps per status. Used by the
// dashboard's attention cards, the appliance detail page header, and its
// Actions section rows, so it lives here once rather than being re-typed
// at each call site.
export type StatusColor = "red" | "yellow" | "green" | "gray";

export const ICON_BADGE_CLASSES: Record<StatusColor, string> = {
  red: "bg-danger-soft text-danger",
  yellow: "bg-amber-soft text-amber",
  green: "bg-good-soft text-good",
  gray: "bg-line-soft text-ink-faint",
};

export const BORDER_LEFT_CLASSES: Record<StatusColor, string> = {
  red: "border-l-danger",
  yellow: "border-l-amber",
  green: "border-l-good",
  gray: "border-l-line",
};

const PILL_CLASSES: Record<StatusColor, string> = {
  red: "border-danger-line bg-danger-soft text-danger",
  yellow: "border-amber-line bg-amber-soft text-amber",
  green: "border-good-line bg-good-soft text-good",
  gray: "border-line bg-line-soft text-ink-faint",
};

const DOT_CLASSES: Record<StatusColor, string> = {
  red: "bg-danger",
  yellow: "bg-amber",
  green: "bg-good",
  gray: "bg-ink-faint",
};

export function StatusPill({
  color,
  children,
}: {
  color: StatusColor;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.04em] ${PILL_CLASSES[color]}`}
    >
      <span className={`h-[5px] w-[5px] rounded-full ${DOT_CLASSES[color]}`} />
      {children}
    </span>
  );
}
