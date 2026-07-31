"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeleteSubscriberButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Bu aboneyi silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ebulten/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Abone başarıyla silindi.");
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

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Sil"
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
