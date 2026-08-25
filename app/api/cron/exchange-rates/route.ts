import { NextRequest, NextResponse } from "next/server";
import { refreshCnyRateFromBi } from "@/lib/exchange-rate/get-cny-rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const { rate, unchanged } = await refreshCnyRateFromBi(); return NextResponse.json({ updated: !unchanged, rate: Number(rate.marketRate), fetchedAt: rate.fetchedAt }); } catch { return NextResponse.json({ error: "Gagal memperbarui kurs CNY dari Bank Indonesia" }, { status: 502 }); }
}
