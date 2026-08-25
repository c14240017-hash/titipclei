import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getLatestCnySellRateFromBi } from "./bank-indonesia";

export async function getStoredCnyRate() {
  return prisma.exchangeRate.findUnique({ where: { targetCurrency: "CNY" } });
}

export async function refreshCnyRateFromBi() {
  const latest = await getLatestCnySellRateFromBi();
  const existing = await getStoredCnyRate();
  const unchanged = Boolean(existing && new Prisma.Decimal(existing.marketRate).equals(latest.sellRate) && existing.sourceDate?.toDateString() === latest.sourceDate.toDateString());
  const rate = await prisma.exchangeRate.upsert({
    where: { targetCurrency: "CNY" },
    create: { baseCurrency: "IDR", targetCurrency: "CNY", marketRate: latest.sellRate, appliedRate: latest.sellRate, buyRate: latest.buyRate, sourceDate: latest.sourceDate, spreadPercent: 0, provider: "Bank Indonesia — Kurs Transaksi BI", fetchedAt: latest.fetchedAt },
    update: { marketRate: latest.sellRate, appliedRate: latest.sellRate, buyRate: latest.buyRate, sourceDate: latest.sourceDate, spreadPercent: 0, provider: "Bank Indonesia — Kurs Transaksi BI", fetchedAt: latest.fetchedAt },
  });
  return { rate, unchanged };
}
