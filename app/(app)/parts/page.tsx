import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PartsBrowser from "./PartsBrowser";

export const dynamic = "force-dynamic";

export default async function PartsPage() {
  await requireSession();
  const parts = await prisma.part.findMany({
    orderBy: { name: "asc" },
  });

  const categories = Array.from(
    new Set(parts.map((p) => p.category)),
  ).sort();

  return (
    <div className="space-y-6 rise">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
            [ Parts catalog · {parts.length} SKUs ]
          </div>
          <h1 className="display-type text-4xl text-ink-100">Parts</h1>
          <p className="text-ink-300 mt-1 text-sm">
            Stock parts across machine types. Add to cart to simulate an order.
          </p>
        </div>
      </header>

      <PartsBrowser
        parts={parts.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          description: p.description,
          price: p.price,
          category: p.category,
          stock: p.stock,
          compatibleTypes: p.compatibleTypes,
        }))}
        categories={categories}
      />
    </div>
  );
}
