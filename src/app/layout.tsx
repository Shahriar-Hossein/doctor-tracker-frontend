import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareTrack | Clinic Administration",
  description: "A clear workspace for managing doctors and patient records.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
