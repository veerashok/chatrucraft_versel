// frontend/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Chataru Craft · Barmer Handicraft Catalog",
  description:
    "Wooden furniture, Barmer embroidery and desert delicacies like Ker & Sangri by Chataru Craft, Boss Enterprises, Barmer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <SiteHeader />
        <div className="min-h-screen">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
