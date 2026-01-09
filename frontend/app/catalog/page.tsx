import CatalogGrid from "@/components/CatalogGrid";
import type { Product } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
  const res = await fetch(`${apiBase}/api/products`, { cache: "no-store" });
  const products: Product[] = await res.json();

  return (
    <main className="min-h-screen bg-sand pt-8 pb-20">
      <div className="container mx-auto px-3 max-w-6xl">
        {/* Heading similar to your catalog.html */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Catalog
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-primary">
            Barmer Bazaar – Products
          </h1>
          <p className="mt-3 text-sm sm:text-base text-dark/80 max-w-2xl mx-auto">
            Explore wooden furniture, hand embroidery from Barmer, and traditional
            desert delicacies like Ker &amp; Sangari under one curated catalog.
          </p>
        </div>

        <CatalogGrid products={products} />

        {/* Small footer line like on your HTML page */}
        <div className="mt-10 text-center text-xs text-gray-600">
          © Chataru Craft · Boss Enterprises · Village Lakhe Ka Tala, Ramjan Ki
          Gafan, Barmer, Rajasthan
        </div>
      </div>
    </main>
  );
}
