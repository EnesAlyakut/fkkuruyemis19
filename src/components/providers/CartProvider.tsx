"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

// CartProvider - simply wraps children, real logic is in Zustand store
export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
