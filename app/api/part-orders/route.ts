import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    const total = Number(body.total || 0);
    const order = await prisma.partOrder.create({
      data: {
        orgId: session.orgId,
        totalPrice: total,
        itemsJson: JSON.stringify(items),
        status: "SIMULATED",
      },
    });
    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("part order error", err);
    return NextResponse.json(
      { error: err?.message || "Could not place order" },
      { status: 500 },
    );
  }
}
