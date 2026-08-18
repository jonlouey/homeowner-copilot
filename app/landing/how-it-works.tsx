import { Droplet, Home as HomeIcon, Zap } from "lucide-react";
import { APPLIANCE_SUMMARIES } from "../dashboard/appliances/[instanceId]/summary-content";
import { BORDER_LEFT_CLASSES, ICON_BADGE_CLASSES, StatusPill, type StatusColor } from "../dashboard/status-styles";
import { SectionHeading } from "./section-heading";

// Reuses the real appliance-detail copy instead of hardcoding a second
// excerpt on the landing page, so the two never drift apart.
const WATER_HEATER_EXCERPT =
  APPLIANCE_SUMMARIES.water_heater.split("without fail")[0] + "without fail...";

const CHIP_PREVIEW: { label: string; on: boolean }[] = [
  { label: "HVAC", on: true },
  { label: "Water heater", on: true },
  { label: "Furnace / boiler", on: false },
  { label: "Electrical panel", on: true },
  { label: "Sump pump", on: false },
];

const DASHBOARD_PREVIEW: {
  icon: typeof Droplet;
  name: string;
  status: StatusColor;
  pill: string;
}[] = [
  { icon: Droplet, name: "Water heater", status: "red", pill: "Overdue" },
  { icon: Zap, name: "Electrical panel", status: "yellow", pill: "Needs info" },
  { icon: HomeIcon, name: "Roof", status: "green", pill: "All good" },
];

function ChipPreview() {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-md">
      <div className="flex flex-wrap gap-2.5">
        {CHIP_PREVIEW.map(({ label, on }) => (
          <span
            key={label}
            className={`inline-flex h-8 items-center rounded-full border-[1.5px] px-3 text-xs font-medium ${
              on ? "border-accent bg-accent-soft text-navy-deep" : "border-line text-ink"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-md">
      {DASHBOARD_PREVIEW.map(({ icon: Icon, name, status, pill }, index) => (
        <div
          key={name}
          className={`flex items-center gap-2.5 rounded-control border border-line border-l-[3px] p-3 ${BORDER_LEFT_CLASSES[status]} ${
            index < DASHBOARD_PREVIEW.length - 1 ? "mb-2" : ""
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${ICON_BADGE_CLASSES[status]}`}
          >
            <Icon size={14} aria-hidden="true" />
          </span>
          <p className="text-[13px] font-semibold text-ink">{name}</p>
          <span className="ml-auto">
            <StatusPill color={status}>{pill}</StatusPill>
          </span>
        </div>
      ))}
    </div>
  );
}

function SummaryPreview() {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-md">
      <p className="text-[12.5px] leading-[1.6] text-ink-muted">
        <strong className="text-[13px] text-ink">Water heater</strong>
        <br />
        <br />
        {WATER_HEATER_EXCERPT}
      </p>
    </div>
  );
}

const STEPS: { number: number; title: string; description: string; preview: React.ReactNode }[] = [
  {
    number: 1,
    title: "Tell us what you have",
    description:
      "Select your house type and the systems, appliances, and safety equipment you actually own. It takes under two minutes — no exact dates or model numbers required.",
    preview: <ChipPreview />,
  },
  {
    number: 2,
    title: "Get a real dashboard, not a checklist",
    description:
      "Every appliance is scored red, yellow, or green based on what actually needs attention — so you know exactly where to focus first, without digging through a wall of tasks.",
    preview: <DashboardPreview />,
  },
  {
    number: 3,
    title: "Understand the why, not just the what",
    description:
      "Every appliance comes with plain-language guidance — what it does, how long it should last, and what actually matters — written like a contractor explaining it to a customer they trust.",
    preview: <SummaryPreview />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-accent-soft px-6 py-16">
      <div className="mx-auto max-w-[1040px]">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a home that runs itself"
          subtitle="No spreadsheets, no guesswork — just tell us what you have and we take it from there."
        />

        {STEPS.map(({ number, title, description, preview }, index) => {
          const reversed = index % 2 === 1;
          return (
            <div
              key={number}
              className={`grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-14 ${
                index < STEPS.length - 1 ? "mb-16" : ""
              }`}
            >
              <div className={reversed ? "md:order-2" : "md:order-1"}>
                <span className="mb-4 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-navy-deep text-[13px] font-bold text-white">
                  {number}
                </span>
                <h3 className="mb-2.5 text-[22px] font-bold tracking-[-0.01em] text-ink">{title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-ink-muted">{description}</p>
              </div>
              <div className={reversed ? "md:order-1" : "md:order-2"}>{preview}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
