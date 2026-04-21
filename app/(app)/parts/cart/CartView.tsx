"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

export default function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    const res = await fetch("/api/part-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          partId: i.partId,
          qty: i.qty,
          price: i.price,
          name: i.name,
          sku: i.sku,
        })),
        total,
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      setError(data.error || "Order failed");
      return;
    }
    setPlaced(data.order.id);
    clear();
    router.refresh();
  }

  if (placed) {
    return (
      <div className="max-w-2xl mx-auto rise">
        <div className="panel p-10 text-center">
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-signal-green mb-3">
            [ Order simulated ]
          </div>
          <h1 className="display-type text-3xl text-ink-100 mb-3">
            Parts order recorded
          </h1>
          <p className="text-ink-300 text-sm max-w-md mx-auto mb-6">
            Order <span className="mono text-rust-400">{placed.slice(-8)}</span>{" "}
            saved. In production MechTrak would route this to your preferred
            parts supplier; this prototype just logs it so the flow is
            demonstrable end-to-end.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/parts" className="btn">
              Back to catalog
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rise max-w-4xl">
      <div>
        <Link
          href="/parts"
          className="mono text-[11px] uppercase tracking-[0.25em] text-ink-300 hover:text-rust-400"
        >
          ← Back to parts
        </Link>
      </div>

      <header>
        <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
          [ Cart · {items.length} line items ]
        </div>
        <h1 className="display-type text-4xl text-ink-100">Review order</h1>
      </header>

      {items.length === 0 ? (
        <div className="panel p-10 text-center">
          <div className="display-type text-lg text-ink-100 mb-1">
            Your cart is empty
          </div>
          <p className="text-ink-400 text-sm mb-6">
            Browse the catalog and add parts compatible with your machines.
          </p>
          <Link href="/parts" className="btn-primary">
            Go to catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="panel overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th className="text-right">Unit</th>
                  <th className="text-right">Line</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.partId}>
                    <td className="text-ink-100">{i.name}</td>
                    <td className="mono text-xs text-rust-400">{i.sku}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) =>
                          setQty(i.partId, Number(e.target.value))
                        }
                        className="input w-20"
                      />
                    </td>
                    <td className="mono text-right text-ink-200">
                      ${i.price.toFixed(2)}
                    </td>
                    <td className="mono text-right text-ink-100">
                      ${(i.price * i.qty).toFixed(2)}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => remove(i.partId)}
                        className="text-ink-400 hover:text-signal-red text-xs mono uppercase tracking-[0.15em]"
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
                  Order total
                </div>
                <div className="display-type text-3xl text-rust-400">
                  ${total.toFixed(2)}
                </div>
              </div>
              {error && (
                <div className="text-sm text-signal-red">{error}</div>
              )}
              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-primary"
              >
                {placing ? "Placing…" : "Place simulated order"}
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-400 mono uppercase tracking-[0.2em]">
            Prototype note · no real fulfillment happens
          </p>
        </>
      )}
    </div>
  );
}
