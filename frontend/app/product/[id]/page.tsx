// frontend/app/product/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/components/ProductCard";

type PageProps = {
  params: { id: string };
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

function getImageUrl(image?: string | null): string {
  if (!image) return "/no-image.png";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  const base = apiBase.replace(/\/+$/, "");
  const path = image.replace(/^\/+/, "");
  return `${base}/${path}`;
}

function inferCategoryLabel(p: Product): string {
  const raw = (p.category || "").toString().toLowerCase();
  const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();
  const src = raw || text;

  if (
    src.includes("ker") ||
    src.includes("sangari") ||
    src.includes("sangri") ||
    src.includes("ker-sangari")
  ) {
    return "Dry Vegetable";
  }
  if (src.includes("bed") || src.includes("sofa") || src.includes("table")) {
    return "Wooden Furniture";
  }
  if (src.includes("wood") || src.includes("sheesham") || src.includes("teak")) {
    return "Wooden Craft";
  }
  if (src.includes("metal") || src.includes("stone") || src.includes("brass")) {
    return "Metal / Stone Art";
  }
  if (src.includes("embroider") || src.includes("dupatta") || src.includes("kurti")) {
    return "Embroidery & Textile";
  }
  return "Handcrafted";
}

function getBadge(p: Product): string | null {
  const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();
  if (text.includes("new")) return "New";
  if (text.includes("bestseller") || text.includes("best seller")) return "Best Seller";
  if (text.includes("popular") || text.includes("famous")) return "Popular";
  return null;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { id } = params;

  if (!apiBase) {
    console.error("NEXT_PUBLIC_API_BASE is not set");
  }

  // ✅ Use the same endpoint as catalog
  const res = await fetch(`${apiBase}/api/products`, { cache: "no-store" });

  if (!res.ok) {
    return notFound();
  }

  const products: Product[] = await res.json();
  const product = products.find((p) => String(p.id) === id);

  if (!product) {
    return notFound();
  }

  const imgUrl = getImageUrl(product.image);
  const categoryLabel = inferCategoryLabel(product);
  const badge = getBadge(product);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91xxxxxxxxxx"; // change this
  const waMessage = encodeURIComponent(
    `Hi, I'm interested in "${product.name}" (ID: ${product.id}) from Chataru Craft. Please share details.`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-5xl px-3 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link href="/catalog" className="hover:underline">
            Catalog
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700 line-clamp-1">{product.name}</span>
        </nav>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
            {/* Image side */}
            <div className="relative">
              {badge && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow">
                  {badge}
                </div>
              )}

              <div className="w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center px-3 py-3">
                <div className="w-full max-h-[420px] flex items-center justify-center overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="max-w-full max-h-[420px] object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                Images are representative; minor variations may occur in handcrafted items.
              </p>
            </div>

            {/* Details side */}
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center w-fit rounded-full bg-amber-50 px-3 py-1 border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  {categoryLabel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-amber-800">
                  ₹ {product.price}
                </div>
              </div>

              {product.description && (
                <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}

              <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <div>
                  <div className="font-semibold text-slate-800">Origin</div>
                  <div>Barmer, Rajasthan · Desert region handicraft</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Seller</div>
                  <div>Chataru Craft · Boss Enterprises</div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 transition shadow-sm"
                >
                  <span className="mr-2 text-lg">💬</span>
                  Buy on WhatsApp
                </a>

                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white text-sm text-slate-700 px-4 py-2.5 hover:bg-slate-50"
                >
                  ← Back to catalog
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[11px] text-slate-500">
          © Chataru Craft · Boss Enterprises · Village Lakhe Ka Tala, Ramjan Ki
          Gafan, Barmer, Rajasthan
        </div>
      </div>
    </main>
  );
}
