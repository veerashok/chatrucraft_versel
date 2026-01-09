"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://chataru-craft-backend-production.up.railway.app";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function login() {
    try {
      setStatus("Logging in…");
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setIsLoggedIn(false);
        setStatus("Wrong password ❌");
        return;
      }
      setIsLoggedIn(true);
      setStatus("Logged in ✔");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setStatus("Login failed ❌");
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggedIn(false);
      setProducts([]);
      setStatus("Logged out");
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`, {
        credentials: "include",
      });
      if (res.status === 401) {
        // Not logged in
        setIsLoggedIn(false);
        setProducts([]);
        setStatus("Please login to manage products.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load products");
      const data: Product[] = await res.json();
      setProducts(data);
      setStatus(`Loaded ${data.length} product(s).`);
      // if we can load products with cookie, we are logged in
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load products ❌");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setStatus("Adding product…");
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        setStatus("Please login first.");
        return;
      }

      if (!res.ok) throw new Error("Add failed");
      setStatus("Product added ✔");
      form.reset();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setStatus("Failed to add product ❌");
    }
  }

  async function saveProduct(id: number, form: HTMLFormElement) {
    const fd = new FormData(form);
    try {
      setStatus("Saving product…");
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        setStatus("Please login first.");
        return;
      }

      if (!res.ok) throw new Error("Save failed");
      setStatus("Product updated ✔");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setStatus("Failed to update product ❌");
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      setStatus("Deleting product…");
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        setStatus("Please login first.");
        return;
      }

      if (!res.ok) throw new Error("Delete failed");
      setStatus("Product deleted ✔");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete product ❌");
    }
  }

  // Try to load products on first mount (will also detect existing session)
  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-700 text-xs font-semibold text-white shadow-sm">
              CC
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                Chataru Craft — Admin Panel
              </div>
              <div className="text-[11px] text-slate-500">
                Manage catalog products & images
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[12px] font-medium text-red-700 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-3 py-6 space-y-8">
        {/* Login panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Admin Access
            </div>
            <div className="mt-1 text-sm text-slate-800">
              {isLoggedIn
                ? "You are logged in."
                : "Login to add or edit products."}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
              />
              <button
                type="button"
                onClick={login}
                className="inline-flex items-center justify-center rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                Login
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-500">{status}</div>
        </div>

        {/* Add product form — ALWAYS visible */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Add new product
            </h2>
            {!isLoggedIn && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
                Login above to save changes
              </span>
            )}
          </div>

          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <input
              name="name"
              required
              placeholder="Product name"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="price"
              type="number"
              min={0}
              required
              placeholder="Price (₹)"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              rows={3}
              placeholder="Short description"
              className="col-span-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="col-span-full flex flex-col gap-1 text-xs text-slate-600">
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <span>
                Upload clear image (your standard size) — layout will adapt.
              </span>
            </div>
            <button
              type="submit"
              className="col-span-full inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
            >
              ➕ Add product
            </button>
          </form>
        </div>

        {/* Existing products list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Existing products
            </h2>
            {loading && (
              <span className="text-xs text-slate-500">Loading…</span>
            )}
          </div>

          {products.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No products yet. Use the <b>“Add new product”</b> form above to
              create your first item in the catalog.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <form
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveProduct(p.id, e.currentTarget);
                  }}
                >

                    {p.image && (
                      <img
                        src={
                          p.image.startsWith("http")
                            ? p.image
                            : `${API_BASE}${p.image}`
                        }
                        alt={p.name}
                        className="h-28 w-auto rounded-md object-cover border"
                      />
                    )}
          

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>ID: {p.id}</span>
                    <span>₹ {p.price}</span>
                  </div>

                  <input
                    name="name"
                    defaultValue={p.name}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="price"
                    type="number"
                    min={0}
                    defaultValue={p.price}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={p.description || ""}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <div className="space-y-1 text-xs text-slate-600">
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div>Leave empty to keep current image.</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-amber-700 py-2 text-xs font-medium text-white hover:bg-amber-800"
                    >
                      💾 Save
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteProduct(p.id)}
                      className="flex-1 rounded-full border border-red-300 bg-red-50 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      ❌ Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t bg-white py-5 text-center text-xs text-slate-500">
        Chataru Craft · Boss Enterprises — Admin Panel
      </footer>
    </main>
  );
}
