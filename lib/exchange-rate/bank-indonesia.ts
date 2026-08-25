const BI_TRANSACTION_RATE_URL =
  "https://www.bi.go.id/biwebservice/wskursbi.asmx/getSubKursLokal3";

function formatBiDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date).replace(/\//g, "-");
}

function parseIndonesianNumber(value: string) {
  const normalized = value.trim().replace(/\s/g, "");
  if (normalized.includes(",") && normalized.includes(".")) {
    return Number(normalized.replace(/\./g, "").replace(",", "."));
  }

  return Number(normalized.replace(",", "."));
}

function getXmlFields(xml: string) {
  return Object.fromEntries(
    [...xml.matchAll(/<([\w:-]+)>([^<]*)<\/\1>/g)].map(([, key, value]) => [key.toLowerCase(), value]),
  );
}

export async function getLatestCnySellRateFromBi() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 14);
  const params = new URLSearchParams({
    mts: "CNY",
    startdate: formatBiDate(startDate),
    enddate: formatBiDate(endDate),
  });
  const response = await fetch(`${BI_TRANSACTION_RATE_URL}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "text/xml" },
  });

  if (!response.ok) {
    throw new Error(`Bank Indonesia mengembalikan status ${response.status}`);
  }

  const xml = await response.text();
  const rows = [...xml.matchAll(/<Table[^>]*>([\s\S]*?)<\/Table>/gi)].map((match) => getXmlFields(match[1]));
  const cnyRow = rows.reverse().find((row) => Object.values(row).some((value) => value === "CNY"));
  const sellRate = cnyRow && Object.entries(cnyRow).find(([key]) => key.includes("jual"));
  const buyRate = cnyRow && Object.entries(cnyRow).find(([key]) => key.includes("beli"));

  if (!sellRate) {
    throw new Error("Kurs jual CNY tidak ditemukan pada respons Bank Indonesia");
  }

  const rate = parseIndonesianNumber(sellRate[1]);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Nilai kurs jual CNY dari Bank Indonesia tidak valid");
  }

  const sourceDateValue = cnyRow && Object.entries(cnyRow).find(([key]) => key.includes("tgl") || key.includes("date"))?.[1];
  const sourceDate = sourceDateValue ? new Date(sourceDateValue) : new Date();
  return { sellRate: rate, buyRate: buyRate ? parseIndonesianNumber(buyRate[1]) : null, sourceDate: Number.isNaN(sourceDate.getTime()) ? new Date() : sourceDate, fetchedAt: new Date() };
}
