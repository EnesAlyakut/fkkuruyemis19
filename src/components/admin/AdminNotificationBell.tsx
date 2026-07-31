"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Bell, Check, ChevronRight, ExternalLink, Package, ShoppingBag, X } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  orderNumber: string | null;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

// Yeni bildirim geldiğinde çalınacak ses (Web Audio API kullanılarak dosyasız üretiliyor)
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Tiz ve yumuşak bir 'ding' sesi frekansları
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Tarayıcı autoplay engeli vb. durumlarda sessizce geç
  }
}

export default function AdminNotificationBell({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // En son görülen bildirimin ID'sini tutar (yeni bildirim tespiti için)
  const lastNotifIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bildirimler", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      
      const newNotifications = data.notifications || [];
      
      // Yeni bir bildirim gelip gelmediğini kontrol et
      if (newNotifications.length > 0) {
        const latestId = newNotifications[0].id;
        const isLatestUnread = !newNotifications[0].isRead;
        
        // Eğer daha önceden bir ID kaydettiysek ve en üstteki ID değiştiyse ve okunmamışsa
        if (lastNotifIdRef.current && lastNotifIdRef.current !== latestId && isLatestUnread) {
          playNotificationSound();
        }
        
        // Ref'i güncelle (sayfa yenilendiğinde ses çalmaması için)
        lastNotifIdRef.current = latestId;
      }

      setNotifications(newNotifications);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // sessizce geç
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/admin/bildirimler", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <>
      {/* Sidebar / Topbar Butonu */}
      {isMobile ? (
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors hover:bg-gray-800 active:bg-gray-700"
          aria-label="Bildirimler"
        >
          <Bell size={20} className={unreadCount > 0 ? "text-amber-400" : ""} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-gray-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="admin-sidebar-link w-full justify-between !text-gray-400 hover:!text-white"
        >
          <div className="flex items-center gap-3">
            <Bell size={18} className={unreadCount > 0 ? "text-amber-400" : ""} />
            <span className="text-sm">Bildirimler</span>
          </div>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Popover - Küçük Dikdörtgen Kutu */}
      <div
        className={`fixed z-[999] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-200 ${
          isMobile
            ? "right-4 top-16 w-[340px] max-h-[450px]" 
            : "bottom-6 right-6 w-[380px] max-h-[500px]"
        } ${
          open ? "translate-y-0 opacity-100 visible" : "translate-y-4 opacity-0 invisible"
        }`}
      >
        {/* Başlık */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shadow-sm border border-amber-200/50">
              <Bell size={18} className="text-amber-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">Bildirimler</p>
              {unreadCount > 0 ? (
                <p className="text-xs font-semibold text-red-500">{unreadCount} yeni bildirim</p>
              ) : (
                <p className="text-xs text-gray-400">Tümü okundu</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex h-8 items-center justify-center rounded-lg bg-green-50 px-2.5 text-[11px] font-bold text-green-700 transition-colors hover:bg-green-100 border border-green-200/50"
                title="Tümünü okundu işaretle"
              >
                <Check size={14} className="mr-1" />
                Okundu
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 border border-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Bildirim Listesi */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-3 px-6 text-center bg-gray-50/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                <Bell size={24} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-600 text-sm">Henüz bildirim yok</p>
                <p className="mt-1 text-xs text-gray-400">Sipariş veya mesajlar buraya düşecek.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-5 py-3.5 transition-colors hover:bg-gray-50 ${
                    !notif.isRead ? "bg-amber-50/30" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                        !notif.isRead 
                          ? "bg-amber-100 text-amber-600 border-amber-200" 
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      <ShoppingBag size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          !notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{notif.body}</p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-gray-400">
                          {timeAgo(notif.createdAt)}
                        </span>
                        {notif.orderId && (
                          <Link
                            href={`/admin/siparisler/${notif.orderId}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-600 transition-colors hover:bg-brand-100 border border-brand-200/50"
                          >
                            <Package size={12} />
                            Siparişi Gör
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {!notif.isRead && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Link */}
        {notifications.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 p-3">
            <Link
              href="/admin/bildirimler"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-50 border border-gray-200 shadow-sm"
            >
              Tüm Bildirimler
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
