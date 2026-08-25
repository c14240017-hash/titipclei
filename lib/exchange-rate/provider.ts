import { CNY_SELL_RATE } from "./rates";

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  marketRate: number;
}

export abstract class ExchangeRateProvider {
  abstract getRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]>;
}

export class MockExchangeRateProvider extends ExchangeRateProvider {
  async getRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]> {
    // Mock rates against IDR
    const mockRates: Record<string, number> = {
      'USD': 15500,
      'JPY': 105,
      'KRW': 11.5,
      'EUR': 16800,
      'SGD': 11600,
      'CNY': CNY_SELL_RATE,
      'THB': 430
    };

    return targetCurrencies.map(currency => ({
      baseCurrency,
      targetCurrency: currency,
      marketRate: mockRates[currency] || 1, // Fallback
    }));
  }
}

// In real app, create ExchangeRatesApiProvider or similar
export class RealExchangeRateProvider extends ExchangeRateProvider {
  async getRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRate[]> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) throw new Error("EXCHANGE_RATE_API_KEY is not set");
    
    // Implementation for real API
    // e.g. fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
    
    return []; 
  }
}

export function getExchangeRateProvider(): ExchangeRateProvider {
  if (process.env.EXCHANGE_RATE_PROVIDER === 'mock') {
    return new MockExchangeRateProvider();
  }
  return new MockExchangeRateProvider(); // Default to mock for now until real API is plugged in
}
