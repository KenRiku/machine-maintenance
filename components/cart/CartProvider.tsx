"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  partId: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (partId: string) => void;
  setQty: (partId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "mechtrak_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartContextType>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return {
      items,
      itemCount,
      total,
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.partId === item.partId);
          if (existing) {
            return prev.map((p) =>
              p.partId === item.partId
                ? { ...p, qty: p.qty + (item.qty || 1) }
                : p,
            );
          }
          return [
            ...prev,
            {
              partId: item.partId,
              sku: item.sku,
              name: item.name,
              price: item.price,
              qty: item.qty || 1,
            },
          ];
        }),
      remove: (partId) =>
        setItems((prev) => prev.filter((p) => p.partId !== partId)),
      setQty: (partId, qty) =>
        setItems((prev) =>
          prev
            .map((p) => (p.partId === partId ? { ...p, qty } : p))
            .filter((p) => p.qty > 0),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return ctx;
}
