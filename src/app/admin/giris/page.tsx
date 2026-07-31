"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminGirisPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Giriş başarılı. Yönlendiriliyorsunuz...");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(data.message || "Giriş başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ── Sol panel (dekoratif) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative"
        style={{
          background: "linear-gradient(145deg, #7c4a0a 0%, #c8830e 45%, #a86a0a 100%)",
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-amber-300/20 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="relative mb-8 h-24 w-24 overflow-hidden rounded-full bg-white/10 ring-4 ring-white/25 shadow-2xl backdrop-blur">
            <Image
              src="/images/logo_circular.png"
              alt="FATİH KARAKUŞ"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight">
            FATİH KARAKUŞ
          </h1>
          <p className="mt-2 text-lg text-amber-100/80 font-medium">Kuruyemiş & Leblebi</p>

          <div className="mt-12 space-y-4 text-left w-full max-w-xs">
            {[
              { icon: ShieldCheck, text: "Güvenli yönetim paneli" },
              { icon: Lock, text: "256-bit şifreli oturum" },
              { icon: Mail, text: "Anlık sipariş bildirimleri" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-amber-100/70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={15} className="text-amber-200" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom brand */}
        <p className="absolute bottom-6 text-xs text-amber-100/40 tracking-widest uppercase">
          Admin Panel © {new Date().getFullYear()}
        </p>
      </div>

      {/* ── Sağ panel (form) ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#fafaf8] p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full shadow-lg ring-2 ring-amber-200">
            <Image
              src="/images/logo_circular.png"
              alt="FATİH KARAKUŞ"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900">FATİH KARAKUŞ</h1>
          <p className="text-xs text-gray-400 mt-0.5">Yönetim Paneli</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              Tekrar hoş geldiniz 👋
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Devam etmek için hesabınıza giriş yapın.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-posta */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                E-posta adresi
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="text"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100 shadow-sm"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Şifre
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-70"
              style={{
                background: loading
                  ? "#c8830e"
                  : "linear-gradient(135deg, #c8830e 0%, #a86a0a 100%)",
                boxShadow: "0 4px 20px rgba(200,131,14,0.45)",
              }}
            >
              {/* Hover shine */}
              <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full skew-x-12" />

              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
            <p className="text-center text-[11px] leading-relaxed text-amber-700/80">
              🔒 Şifrenizi unuttuysanız yönetici kaydını güncelleyin veya seed scriptini tekrar çalıştırın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
