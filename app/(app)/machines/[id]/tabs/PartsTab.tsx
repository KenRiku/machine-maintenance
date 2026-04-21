"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

type Part = {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  stock: number;
};

export default function PartsTab({
  machineId,
  parts,
}: {
  machineId: string;
  parts: Part[];
}) {
  const { add, itemCount } = useCart();
  const [query, setQuery] = useState("");
  const filtered = parts.filter((p) =>
    (p.name + p.sku + p.description).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <div className="display-type text-lg text-ink-100">
            Compatible parts
          </div>
          <p className="mono text-[10px] text-ink-300 uppercase tracking-[0.2em] mt-0.5">
            {parts.length} items in catalog match this machine type
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="input w-64"
            placeholder="Search parts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Link href="/parts" className="btn">
            Full catalog
          </Link>
          <Link href="/parts/cart" className="btn-primary">
            Cart ({itemCount})
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center">
          <div className="display-type text-base text-ink-100 mb-1">
            No compatible parts
          </div>
          <p className="text-ink-400 text-sm">
            Nothing in the catalog matches this machine type yet. Check the
            full catalog for adjacent SKUs.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-ink-900 p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
                  {p.category}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-signal-green">
                  {p.stock} in stock
                </span>
              </div>
              <div className="display-type text-lg text-ink-100 mb-1">
                {p.name}
              </div>
              <div className="mono text-[10px] text-rust-400 mb-3">
                {p.sku}
              </div>
              <p className="text-xs text-ink-300 flex-1 mb-4 leading-relaxed line-clamp-3">
                {p.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="display-type text-lg text-ink-100">
                  ${p.price.toFixed(2)}
                </div>
                <button
                  onClick={() =>
                    add({
                      partId: p.id,
                      name: p.name,
                      sku: p.sku,
                      price: p.price,
                    })
                  }
                  className="btn text-xs"
                >
                  + Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
