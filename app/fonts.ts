import { Inter } from "next/font/google";

// Single font family per docs/designs/design-system.md ("Typography").
export const sansFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
