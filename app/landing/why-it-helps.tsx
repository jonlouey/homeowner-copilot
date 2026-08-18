import { Bell, Home, MessageSquare, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const VALUE_CARDS = [
  {
    icon: Home,
    title: "Built for your home",
    description: "A checklist specific to what you actually own, not a generic list.",
  },
  {
    icon: ShieldCheck,
    title: "Know what matters",
    description: "Real urgency, not a flat list — so you know where to focus first.",
  },
  {
    icon: MessageSquare,
    title: "Explained plainly",
    description: "No jargon — plain-language guidance on what to watch for.",
  },
  {
    icon: Bell,
    title: "Timely, not overwhelming",
    description: "Nudged only when something's due — never buried in tasks.",
  },
];

export function WhyItHelps() {
  return (
    <section id="value" className="bg-paper px-6 py-16">
      <div className="mx-auto max-w-[1040px]">
        <SectionHeading eyebrow="Why it helps" title="Built around how busy homeowners actually think" />

        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {VALUE_CARDS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-card border-[1.5px] border-line p-5">
              <span className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mb-1.5 text-[14.5px] font-semibold text-ink">{title}</h3>
              <p className="text-[12.5px] leading-[1.5] text-ink-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
