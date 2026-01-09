// frontend/components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const showAdminLink = pathname !== "/"; // ✅ hide Admin on home

  return (
    <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3">
        {/* Logo + brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-700 text-xs font-semibold text-white shadow-sm">
            CC
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              Chataru Craft
            </div>
            <div className="text-[11px] text-slate-500">
              Boss Enterprises · Barmer, Rajasthan
            </div>
          </div>
        </Link>

        {/* Simple nav */}
        <nav className="hidden items-center gap-5 text-xs sm:flex">
          <Link
            href="/"
            className="text-slate-700 hover:text-amber-700 transition"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="text-slate-700 hover:text-amber-700 transition"
          >
            Catalog
          </Link>
          <Link
            href="/contact"
            className="text-slate-700 hover:text-amber-700 transition"
          >
            Contact
          </Link>

          {showAdminLink && (
            <Link
              href="/admin"
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
            >
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
