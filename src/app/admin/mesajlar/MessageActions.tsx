"use client";

import { useState } from "react";
import { CheckCircle2, Reply, Loader2, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function MessageActions({ msg }: { msg: any }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const router = useRouter();

  const handleMarkAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mesajlar/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
      });
      if (res.ok) {
        toast.success("Mesaj okundu olarak işaretlendi.");
        router.refresh();
      } else {
        toast.error("İşlem başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return toast.error("Yanıt boş olamaz.");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mesajlar/${msg.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: replyText })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Yanıt e-posta olarak gönderildi!");
        setIsModalOpen(false);
        setReplyText("");
        router.refresh();
      } else {
        toast.error(data.error || "İşlem başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mesajlar/${msg.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Mesaj silindi.");
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
    <>
      <div className="flex items-center justify-end gap-2">
        {!msg.isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={loading}
            title="Okundu İşaretle"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={loading || msg.isReplied}
          title={msg.isReplied ? "Yanıtlandı" : "Yanıtla"}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            msg.isReplied ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-brand-100 text-brand-600 hover:bg-brand-200"
          }`}
        >
          <Reply size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          title="Sil"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Yanıt Gönder: {msg.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Bu mesaj müşterinin <strong className="text-gray-900">{msg.email}</strong> adresine e-posta olarak iletilecektir.
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 h-32 resize-none outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="Mesajınızı buraya yazın..."
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                İptal
              </button>
              <button onClick={handleSendReply} disabled={loading} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {loading && <Loader2 size={16} className="animate-spin" />}
                E-posta Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
