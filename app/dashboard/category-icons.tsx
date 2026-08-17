import { Home, Refrigerator, Shield, type LucideIcon, Zap } from "lucide-react";
import type { CategoryId } from "./data";

// One icon per fixed category, matching the shapes used in the mockup
// (dashboard.html): a bolt for Systems, a house for Exterior, an
// appliance-like rect for Appliances, a shield for Safety.
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  systems: Zap,
  exterior: Home,
  appliances: Refrigerator,
  safety: Shield,
};

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  systems: "Systems",
  exterior: "Exterior",
  appliances: "Appliances",
  safety: "Safety",
};
