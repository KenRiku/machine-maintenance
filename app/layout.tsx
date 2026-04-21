import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MechTrak — Machine Maintenance",
  description:
    "Enroll every machine, schedule every PM, log every repair. MechTrak replaces spreadsheets, sticky notes, and Gary's memory with a single industrial platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
