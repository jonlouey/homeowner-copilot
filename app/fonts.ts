import { IBM_Plex_Mono, Public_Sans, Space_Grotesk } from "next/font/google";

// Three-role pairing per docs/designs/design-system.md ("Typography").
// Variable names are deliberately distinct from the --font-display/-body/
// -mono tokens defined in globals.css's @theme block, which reference
// these via var(...) — reusing the same name on both sides would collide.
export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

export const bodyFont = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-public-sans",
});

export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});
