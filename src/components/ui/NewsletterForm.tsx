"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Başarıyla abone oldunuz! 🎉 İlk siparişinizde %10 indirim kazandınız.");
        setEmail("");
      } else {
        toast.error(data.message || "Bir hata oluştu, tekrar deneyin.");
      }
    } catch {
      toast.error("Bağlantı hatası, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleNewsletter}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz..."
        required
        disabled={loading}
        className="min-w-0 flex-1 px-5 py-3.5 rounded-xl bg-white border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all disabled:opacity-60 shadow-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        {loading ? "Gönderiliyor..." : "Abone Ol"}
      </button>
    </form>
  );
}
