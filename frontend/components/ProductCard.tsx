"use client";

import Link from "next/link";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string | null;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

// Build final image URL from backend path or absolute URL
function getImageUrl(image?: string | null): string {
  if (!image) return "/no-image.png";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  const base = apiBase.replace(/\/+$/, "");
  const path = image.replace(/^\/+/, "");
  return `${base}/${path}`;
}

// Infer a nice category label for the chip
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

// Simple badge: New / Popular / Best Seller
function getBadge(p: Product): string | null {
  const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();
  if (text.includes("new")) return "New";
  if (text.includes("bestseller") || text.includes("best seller")) return "Best Seller";
  if (text.includes("popular") || text.includes("famous")) return "Popular";
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const imgUrl = getImageUrl(product.image);
  const categoryLabel = inferCategoryLabel(product);
  const badge = getBadge(product);

  return (
    <Link href={`/product/${product.id}`} className="block group" prefetch={false}>
      <article className="relative h-full flex flex-col rounded-xl border border-orange-100 bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
        {/* Corner badge */}
        {badge && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-secondary/90 text-[10px] font-semibold text-dark shadow-sm">
            {badge}
          </div>
        )}

        {/* 🔒 FIXED IMAGE SLOT (same as before) */}
        <div className="w-full bg-gray-50 flex items-center justify-center px-3 pt-3 pb-2">
          <div className="w-full h-48 flex items-center justify-center overflow-hidden">
            <img
              src={imgUrl}
              alt={product.name}
              loading="lazy"
              className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* TEXT AREA */}
        <div className="flex-1 flex flex-col gap-1.5 px-3 pb-3 pt-1">
          {/* Category chip */}
          <div className="inline-flex items-center w-fit rounded-full bg-secondary/10 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary mr-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
              {categoryLabel}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-primary">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mt-1 flex items-center justify-between">
            <div className="text-sm font-bold text-primary">
              ₹ {product.price}
            </div>
            <span className="text-[11px] text-gray-500 group-hover:text-primary group-hover:underline">
              View details
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
