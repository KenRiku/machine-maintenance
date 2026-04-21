"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type Part = {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  compatibleTypes: string[];
};

export default function PartsBrowser({
  parts,
  categories,
}: {
  parts: Part[];
  categories: string[];
}) {
  const { add, itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");

  const filtered = parts.filter((p) => {
    if (cat && p.category !== cat) return false;
    if (
      query &&
      !(p.name + p.sku + p.description + p.category)
        .toLowerCase()
        .includes(query.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input flex-1 min-w-[240px] max-w-md"
          placeholder="Search parts by name, SKU, description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="select w-auto"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Link href="/parts/cart" className="btn-primary">
          Cart ({itemCount})
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center">
          <div className="display-type text-lg text-ink-100 mb-1">
            No parts match
          </div>
          <p className="text-ink-400 text-sm">
            Try clearing filters or searching a different SKU.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5">
          {filtered.map((p) => (
            <div key={p.id} className="bg-ink-900 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
                  {p.category}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-signal-green">
                  ● {p.stock}
                </span>
              </div>
              <div className="display-type text-base text-ink-100 mb-1">
                {p.name}
              </div>
              <div className="mono text-[10px] text-rust-400 mb-3">{p.sku}</div>
              <p className="text-xs text-ink-300 flex-1 mb-3 leading-relaxed line-clamp-3">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {p.compatibleTypes.slice(0, 3).map((t) => (
                  <span key={t} className="chip-mute text-[9px]">
                    {t}
                  </span>
                ))}
              </div>
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
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
