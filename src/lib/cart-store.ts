"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  includeInstallation: boolean;
};

type CartState = {
  items: CartLine[];
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setInstallation: (productId: string, enabled: boolean) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
  addItem: (item) => set((state) => {
    const existing = state.items.find((line) => line.productId === item.productId);
    if (existing) return { items: state.items.map((line) => line.productId === item.productId ? { ...line, quantity: Math.min(line.stock, line.quantity + (item.quantity ?? 1)), includeInstallation: line.includeInstallation || item.includeInstallation } : line) };
    return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
  }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((line) => line.productId !== productId) })),
  setQuantity: (productId, quantity) => set((state) => ({ items: state.items.map((line) => line.productId === productId ? { ...line, quantity: Math.max(1, Math.min(line.stock, quantity)) } : line) })),
  setInstallation: (productId, enabled) => set((state) => ({ items: state.items.map((line) => line.productId === productId ? { ...line, includeInstallation: enabled } : line) })),
  clear: () => set({ items: [] }),
}), {
  name: "adetech-cart-v1",
  onRehydrateStorage: () => (state) => {
    state?.setHydrated(true);
    if (typeof window !== "undefined") {
      const count = state?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      window.localStorage.setItem("adetech-cart-count", String(count));
      window.dispatchEvent(new Event("adetech:cart-updated"));
    }
  },
  partialize: (state) => ({ items: state.items }) as CartState,
}));
