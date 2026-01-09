"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: number | string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string | null;
};

const CATEGORIES = [
  { id: "embroidery", label: "Embroidery & Textile" },
  { id: "dry", label: "Dry Vegetables (Ker & Sangari)" },
  { id: "wood", label: "Wooden Handicraft" },
  { id: "metal", label: "Metal / Stone Art" },
];

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

/** Build a proper image URL from backend path or full URL. */
function getImageUrl(image: string | undefined | null): string {
  if (!image) return "/no-image.png"; // placeholder

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const base = apiBase.replace(/\/+$/, "");
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${base}${path}`;
}

/** Try to infer category on frontend based on product fields. */
function inferCategory(p: Product): string {
  if (p.category) {
    const cat = p.category.toString().toLowerCase();
    if (cat.includes("dry")) return "dry";
    if (cat.includes("wood")) return "wood";
    if (cat.includes("metal") || cat.includes("stone")) return "metal";
    if (cat.includes("embroider") || cat.includes("textile")) return "embroidery";
  }

  const name = (p.name || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  const text = `${name} ${desc}`;

  if (
    text.includes("ker") ||
    text.includes("sangari") ||
    text.includes("sangri") ||
    text.includes("ker sangari") ||
    text.includes("ker-sangari")
  ) {
    return "dry";
  }

  if (
    text.includes("wood") ||
    text.includes("sheesham") ||
    text.includes("teak") ||
    text.includes("charpai")
  ) {
    return "wood";
  }

  if (
    text.includes("brass") ||
    text.includes("metal") ||
    text.includes("stone") ||
    text.includes("marble")
  ) {
    return "metal";
  }

  return "embroidery";
}

/** Decide a badge text based on content (simple heuristic). */
function getBadge(p: Product): string | null {
  const text = `${p.name || ""} ${p.description || ""}`.toLowerCase();

  if (text.includes("new") || text.includes("latest")) return "New";
  if (text.includes("bestseller") || text.includes("best seller")) return "Best Seller";
  if (text.includes("popular") || text.includes("famous")) return "Popular";

  // Small trick: dry items often popular
  if (inferCategory(p) === "dry") return "Popular";

  return null;
}

/** Build WhatsApp link (if number configured). */
function getWhatsAppLink(p: Product): string | null {
  if (!whatsappNumber) return null;
  const cleaned = whatsappNumber.replace(/[^0-9]/g, "");
  if (!cleaned) return null;

  const message = `Hi, I'm interested in "${p.name}" (₹${p.price}). Please share details.`;
  const encoded = encodeURIComponent(message);

  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export default function CatalogTabs({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<string>("embroidery");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => inferCategory(p) === category);
  }, [products, category]);

  const handleCardClick = (product: Product) => {
    setActiveProduct(product);
  };

  const handleCloseModal = () => {
    setActiveProduct(null);
  };

  const handleWhatsAppClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const link = getWhatsAppLink(product);
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-3 px-2 pb-4 pt-2 scrollbar-hide">
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

        {/* Product Grid */}
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 py-4"
        >
          {filtered.map((p) => {
            const badge = getBadge(p);
            const waLink = getWhatsAppLink(p);

            return (
              <motion.div
                whileHover={{ scale: 1.03, translateY: -2 }}
                key={p.id}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl p-3 cursor-pointer border border-gray-100 flex flex-col"
                onClick={() => handleCardClick(p)}
              >
                {/* Badge */}
                {badge && (
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold px-2 py-1 rounded-full bg-secondary text-dark shadow-sm">
                    {badge}
                  </span>
                )}

                {/* IMAGE AREA – natural ratio, no distortion, hover zoom */}
                <div className="bg-sand/70 rounded-xl flex items-center justify-center p-3">
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-auto max-h-48 object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>

                {/* TEXT AREA */}
                <div className="mt-3 flex flex-col gap-1 flex-1">
                  <div className="text-[11px] uppercase tracking-wide text-secondary">
                    {inferCategory(p) === "dry" && "Dry Vegetable"}
                    {inferCategory(p) === "embroidery" && "Embroidery / Textile"}
                    {inferCategory(p) === "wood" && "Wooden Handicraft"}
                    {inferCategory(p) === "metal" && "Metal / Stone Art"}
                  </div>
                  <div className="text-sm font-semibold line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">₹{p.price}</div>
                </div>

                {/* WhatsApp button (small) */}
                {waLink && (
                  <button
                    onClick={(e) => handleWhatsAppClick(e, p)}
                    className="mt-2 text-[11px] px-3 py-1 rounded-full bg-accent text-white font-medium self-start hover:bg-primary transition-colors"
                  >
                    Order on WhatsApp
                  </button>
                )}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-6">
              No products found in this category yet.
            </div>
          )}
        </motion.div>
      </div>

      {/* FULL IMAGE POPUP / MODAL */}
      <AnimatePresence>
        {activeProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-sand/60">
                <div className="text-xs uppercase tracking-wide text-secondary">
                  {inferCategory(activeProduct) === "dry" && "Dry Vegetable"}
                  {inferCategory(activeProduct) === "embroidery" && "Embroidery / Textile"}
                  {inferCategory(activeProduct) === "wood" && "Wooden Handicraft"}
                  {inferCategory(activeProduct) === "metal" && "Metal / Stone Art"}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100"
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal body */}
              <div className="p-4 flex flex-col gap-3">
                <div className="w-full bg-sand/70 rounded-xl flex items-center justify-center p-3">
                  <img
                    src={getImageUrl(activeProduct.image)}
                    alt={activeProduct.name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold mb-1">
                    {activeProduct.name}
                  </h2>
                  <div className="text-sm text-gray-700 mb-2">
                    ₹{activeProduct.price}
                  </div>
                  {activeProduct.description && (
                    <p className="text-xs text-gray-600 whitespace-pre-line">
                      {activeProduct.description}
                    </p>
                  )}
                </div>

                {/* Modal WhatsApp button (big) */}
                {getWhatsAppLink(activeProduct) && (
                  <button
                    onClick={() => {
                      const link = getWhatsAppLink(activeProduct);
                      if (link) window.open(link, "_blank");
                    }}
                    className="mt-2 w-full text-sm px-4 py-2 rounded-full bg-accent text-white font-semibold hover:bg-primary transition-colors"
                  >
                    Order this on WhatsApp
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
