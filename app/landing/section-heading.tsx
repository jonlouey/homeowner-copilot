// Shared by "How it works" and "Why it helps" — both sections use the
// identical eyebrow/title/subtitle pattern in the reference.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-[520px] text-center">
      <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-[.08em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mb-3 text-[28px] font-bold tracking-[-0.01em] text-navy-deep">{title}</h2>
      {subtitle && <p className="text-[15px] leading-[1.55] text-ink-muted">{subtitle}</p>}
    </div>
  );
}
