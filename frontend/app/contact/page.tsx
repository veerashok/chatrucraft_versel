
"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [product, setProduct] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("product");
      if (p) setProduct(p);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      sourcePage: "contact",
    };

    try {
      const res = await fetch(`${API_BASE}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setStatus("Failed to submit. Please try again.");
        return;
      }
      setStatus("Thank you! We will contact you soon.");
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong.");
    }
  }

  return (
    <div className="container" style={{ padding: "2rem 0", maxWidth: "640px" }}>
      <h1>Contact / Bulk enquiry</h1>
      <p style={{ color: "#6b5b4b", fontSize: "0.9rem" }}>
        Share your requirement for retail, bulk or online marketplace listings. We&apos;ll respond on
        WhatsApp / email with prices and options.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
        <div>
          <label>Name</label>
          <input name="name" required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" required />
        </div>
        <div>
          <label>Phone</label>
          <input name="phone" />
        </div>
        <div>
          <label>Message</label>
          <textarea
            name="message"
            rows={4}
            defaultValue={product ? `Enquiry about: ${product}\n` : ""}
          />
        </div>
        <button className="btn btn-primary" type="submit">Submit enquiry</button>
      </form>

      {status && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          {status}
        </p>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#6b5b4b" }}>
        Or contact directly: <strong>chatruop1991@gmail.com</strong> · <strong>+91 63752 69136</strong>
      </p>
    </div>
  );
}
