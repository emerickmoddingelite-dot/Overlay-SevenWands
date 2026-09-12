import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SevenWands FA — Overlay Manager",
  description: "Gestionnaire professionnel des overlays SevenWands FA."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Providers />
        </ThemeProvider>
      </body>
    </html>
  );
}
