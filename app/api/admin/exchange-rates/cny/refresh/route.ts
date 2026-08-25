import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { getStoredCnyRate, refreshCnyRateFromBi } from "@/lib/exchange-rate/get-cny-rate";
import { CNY_SELL_RATE, CNY_SELL_RATE_AS_OF } from "@/lib/exchange-rate/rates";

export const runtime = "nodejs";

const positiveRate = (value: unknown, fallback = CNY_SELL_RATE) => {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : fallback;
};

export async function POST() {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  try {
    const { rate, unchanged } = await refreshCnyRateFromBi();
    return NextResponse.json({ rate: positiveRate(rate.marketRate), buyRate: rate.buyRate ? Number(rate.buyRate) : null, sourceDate: rate.sourceDate, fetchedAt: rate.fetchedAt, unchanged, fallback: false });
  } catch {
    const stored = await getStoredCnyRate().catch(() => null);
    const date = stored?.sourceDate ?? stored?.fetchedAt;
    return NextResponse.json({
      rate: positiveRate(stored?.marketRate),
      buyRate: stored?.buyRate ? Number(stored.buyRate) : null,
      sourceDate: date?.toISOString() ?? null,
      asOf: date?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) ?? CNY_SELL_RATE_AS_OF,
      unchanged: true,
      fallback: true,
      message: "Bank Indonesia sementara tidak dapat dihubungi. Menggunakan kurs terakhir yang tersimpan.",
    });
  }
}
