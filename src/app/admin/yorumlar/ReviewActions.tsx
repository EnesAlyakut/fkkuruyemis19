"use client";

import { useState } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ReviewActions({ id, isApproved }: { id: string, isApproved: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/yorumlar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !isApproved })
      });
      if (res.ok) {
        toast.success(isApproved ? "Yorum yayından kaldırıldı." : "Yorum onaylandı ve yayına alındı!");
        router.refresh();
      } else {
        toast.error("İşlem başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu yorumu tamamen silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/yorumlar/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Yorum silindi.");
        router.refresh();
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={handleToggleApprove}
        disabled={loading}
        title={isApproved ? "Yayından Kaldır" : "Onayla"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          isApproved ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-green-100 text-green-600 hover:bg-green-200"
        }`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : isApproved ? <X size={16} /> : <Check size={16} />}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Tamamen Sil"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
