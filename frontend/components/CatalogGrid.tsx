"use client";

import { useMemo, useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "embroidery", label: "Embroidery & Textile" },
  { id: "dry", label: "Dry Vegetables (Ker & Sangari)" },
  { id: "wood", label: "Wooden Handicraft" },
  { id: "metal", label: "Metal / Stone Art" },
];

function inferCategoryKey(p: Product): string {
  const raw = (p.category || "").toString().toLowerCase();
  const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();
  const src = raw || text;

  if (
    src.includes("ker") ||
    src.includes("sangari") ||
    src.includes("sangri") ||
    src.includes("ker-sangari")
  ) {
    return "dry";
  }
  if (src.includes("wood") || src.includes("sheesham") || src.includes("teak") || src.includes("bed") || src.includes("sofa")) {
    return "wood";
  }
  if (src.includes("metal") || src.includes("stone") || src.includes("brass")) {
    return "metal";
  }
  if (src.includes("embroider") || src.includes("dupatta") || src.includes("kurti")) {
    return "embroidery";
  }
  return "embroidery";
}

export default function CatalogGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => inferCategoryKey(p) === category);
  }, [products, category]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Category tabs */}
      <div className="flex overflow-x-auto gap-3 px-1 pb-4 pt-2 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm sm:text-base transition
              ${
                category === c.id
                  ? "bg-primary text-white border-primary shadow-lg"
                  : "bg-white text-dark border-gray-300 hover:bg-secondary/10"
              }
            `}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of product cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-gray-500 py-6">
            No products in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
