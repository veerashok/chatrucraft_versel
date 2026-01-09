// frontend/components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold text-slate-800">
            Chataru Craft · Boss Enterprises
          </div>
          <div>Village Lakhe Ka Tala, Ramjan Ki Gafan, Barmer, Rajasthan</div>
          <div>Barmer · Rajasthan · India</div>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-50 px-3 py-1">
              ✅ Authentic Barmer handicraft
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1">
              🌵 Ker & Sangri desert delicacies
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <span>© {new Date().getFullYear()} Chataru Craft</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/contact" className="underline-offset-2 hover:underline">
              Contact & enquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
