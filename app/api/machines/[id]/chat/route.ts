import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 30;

function buildSystemPrompt(
  machine: any,
  logs: any[],
  openWorkOrders: any[],
  compatibleParts: any[],
): string {
  const logSummary =
    logs.length === 0
      ? "No prior service entries on file."
      : logs
          .slice(0, 10)
          .map(
            (l: any) =>
              `- [${new Date(l.createdAt).toISOString().slice(0, 10)}] ${l.type}${l.workOrder ? `: ${l.workOrder.title}` : ""} — ${l.notes}${l.partsUsed ? ` (parts: ${l.partsUsed})` : ""}`,
          )
          .join("\n");

  const openSummary =
    openWorkOrders.length === 0
      ? "None currently open."
      : openWorkOrders
          .map(
            (w: any) =>
              `- [${w.type}, ${w.status}] ${w.title}${w.description ? ` — ${w.description}` : ""}`,
          )
          .join("\n");

  const partsSummary =
    compatibleParts.length === 0
      ? "No compatible parts in catalog."
      : compatibleParts
          .slice(0, 15)
          .map((p: any) => `- ${p.sku} · ${p.name} ($${p.price})`)
          .join("\n");

  return `You are MechTrak's Repair Assistant — a senior industrial maintenance technician embedded in a CMMS (Computerized Maintenance Management System). You advise floor operators and maintenance leads on a specific machine.

## The machine you are advising on
- Name: ${machine.name}
- Type: ${machine.type}
- Manufacturer: ${machine.manufacturer}
- Model: ${machine.model}
- Serial: ${machine.serialNumber}
- Location: ${machine.location}
- Current status: ${machine.status}
- Operator notes: ${machine.notes || "(none)"}

## Recent service history (most recent first)
${logSummary}

## Open work orders
${openSummary}

## Compatible parts on hand
${partsSummary}

## How to respond
- Be direct, plain-spoken, and practical. Industrial technicians do not want fluff.
- For diagnostic questions, give a short ordered checklist of things to inspect, from most-likely to least-likely.
- For repair questions, give numbered steps. Call out safety lockout/tagout steps where appropriate.
- When a compatible part number from the list above is relevant, name it.
- If the question is safety-critical (electrical, pressure vessel, rotating equipment teardown), add a brief disclaimer to consult OEM documentation and follow LOTO procedures.
- Keep responses under ~200 words unless the user asks for depth.`;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const machine = await prisma.machine.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!machine)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let content = "";
  try {
    const body = await req.json();
    content = String(body.content || "").trim();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!content)
    return NextResponse.json({ error: "Message required" }, { status: 400 });

  const [prior, serviceLogs, openWorkOrders, compatibleParts] =
    await Promise.all([
      prisma.chatMessage.findMany({
        where: { machineId: id },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
      prisma.serviceLog.findMany({
        where: { machineId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { workOrder: true },
      }),
      prisma.workOrder.findMany({
        where: { machineId: id, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.part.findMany({
        where: { compatibleTypes: { has: machine.type } },
        take: 30,
      }),
    ]);

  const userMessage = await prisma.chatMessage.create({
    data: {
      machineId: id,
      userId: session.userId,
      role: "user",
      content,
    },
  });

  let assistantText: string;
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      assistantText = `The AI assistant is not configured yet. Set ANTHROPIC_API_KEY in the environment to enable live responses. In the meantime: for "${content.slice(0, 80)}", start by checking the machine's most recent service log for a similar failure mode, visually inspect for leaks, listen for abnormal noise, and measure temperatures against normal operating ranges before escalating.`;
    } else {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const history = prior.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const resp = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        system: buildSystemPrompt(
          machine,
          serviceLogs,
          openWorkOrders,
          compatibleParts,
        ),
        messages: [...history, { role: "user", content }],
      });
      const text = resp.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n")
        .trim();
      assistantText = text || "I wasn't able to generate a response.";
    }
  } catch (err: any) {
    console.error("assistant error", err);
    assistantText = `The assistant hit an error: ${err?.message || "unknown"}. Please retry in a moment.`;
  }

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      machineId: id,
      userId: session.userId,
      role: "assistant",
      content: assistantText,
    },
  });

  return NextResponse.json({
    userMessage: {
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content,
      createdAt: userMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: assistantMessage.role,
      content: assistantMessage.content,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  });
}
