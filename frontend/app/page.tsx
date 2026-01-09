// frontend/app/page.tsx
import Link from "next/link";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91xxxxxxxxxx"; // change to your number
const waMessage = encodeURIComponent(
  "Hi, I would like to know more about your products on Chataru Craft."
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ✅ Hero / above-the-fold section (NO header here now) */}
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-3 pb-12 pt-8 md:flex-row md:items-center">
        {/* Left: text */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Handcrafted · Barmer, Rajasthan
            </span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
            Barmer&apos;s{" "}
            <span className="text-amber-700">wooden craft, embroidery</span>{" "}
            & desert delicacies – in one catalog.
          </h1>

          <p className="max-w-xl text-sm text-slate-700 sm:text-[15px]">
            From solid wood furniture and traditional Barmer embroidery to
            desert specialties like <b>Ker</b> and <b>Sangri</b> – discover
            everything curated under <b>Chataru Craft</b>, powered by{" "}
            <b>Boss Enterprises</b>.
          </p>

          {/* Primary actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-800"
            >
              Browse full catalog
              <span className="ml-2 text-lg">↗</span>
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <span className="mr-2 text-lg">💬</span>
              Talk on WhatsApp
            </a>
          </div>

          {/* Tiny reassurance row */}
          <div className="mt-1 grid max-w-xl gap-2 text-[11px] text-slate-600 sm:grid-cols-3">
            <div className="flex items-center gap-1.5">
              <span>✅</span>
              <span>Authentic Barmer handicraft</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🌾</span>
              <span>Ker & Sangri direct from desert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🚚</span>
              <span>Pan-India enquiry & shipping</span>
            </div>
          </div>
        </div>

        {/* Right: decorative “preview” column */}
        <div className="flex-1">
          <div className="relative mx-auto max-w-md">
            {/* Background blob */}
            <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-3xl bg-gradient-to-br from-amber-100 via-rose-50 to-emerald-50 blur-sm" />

            <div className="space-y-3 rounded-3xl border border-amber-100 bg-white/90 p-4 shadow-sm backdrop-blur">
              {/* Wooden furniture preview card */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700/90 text-xl text-white shadow-sm">
                  🛏️
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Wooden Furniture
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Solid wood beds, tables & more
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sheesham & other hardwood from Barmer.
                  </div>
                </div>
              </div>

              {/* Embroidery preview card */}
              <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-xl text-white shadow-sm">
                  🧵
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">
                    Barmer Embroidery
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Dupattas, kurtis & home linen
                  </div>
                  <div className="text-[11px] text-amber-900/70">
                    Hand work by local women artisans.
                  </div>
                </div>
              </div>

              {/* Dry veg preview card */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl text-white shadow-sm">
                  🌵
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                    Ker · Sangri · Desert Veg
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Sun-dried, cleaned & packed
                  </div>
                  <div className="text-[11px] text-emerald-900/80">
                    Traditional Rajasthani flavours from Barmer.
                  </div>
                </div>
              </div>

              {/* Small link to catalog */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                <span>One catalog for all categories.</span>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1 font-medium text-amber-700 hover:text-amber-800"
                >
                  View catalog
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple band under hero (kept; global footer is separate) */}
      <section className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-slate-800">
              Chataru Craft · Boss Enterprises
            </div>
            <div>
              Village Lakhe Ka Tala, Ramjan Ki Gafan, Barmer, Rajasthan
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-50 px-3 py-1">
              ✅ Registered handicraft seller
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1">
              📦 Bulk & retail enquiries welcome
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
