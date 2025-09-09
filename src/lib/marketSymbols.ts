export type TvSymbol = { display: string; tvSymbol: string; exchange: string };

export const MARKET_SYMBOLS: Record<string, TvSymbol> = {
	// Use popular ETFs to avoid index feed restrictions
	NASDAQ: { display: 'NASDAQ-100 (QQQ)', tvSymbol: 'NASDAQ:QQQ', exchange: 'NASDAQ' },
	"S&P500": { display: 'S&P 500 (SPY)', tvSymbol: 'AMEX:SPY', exchange: 'AMEX' },
	DOW: { display: 'Dow Jones (DIA)', tvSymbol: 'AMEX:DIA', exchange: 'AMEX' },
	RUSSELL: { display: 'Russell 2000 (IWM)', tvSymbol: 'AMEX:IWM', exchange: 'AMEX' },
	// Direct index symbols (may require paid feed in some regions)
	IXIC: { display: 'NASDAQ Composite', tvSymbol: 'NASDAQ:IXIC', exchange: 'NASDAQ' },
	NDX: { display: 'NASDAQ-100', tvSymbol: 'NASDAQ:NDX', exchange: 'NASDAQ' },
	SPX: { display: 'S&P 500', tvSymbol: 'SP:SPX', exchange: 'SP' },
	DJI: { display: 'Dow Jones', tvSymbol: 'DJ:DJI', exchange: 'DJ' },
	RTY: { display: 'Russell 2000', tvSymbol: 'CME_MINI:RTY1!', exchange: 'CME_MINI' },
};

export function getTvSymbol(key: string, fallbackEtf: boolean = true): TvSymbol | null {
	if (MARKET_SYMBOLS[key]) return MARKET_SYMBOLS[key];
	if (fallbackEtf) {
		switch (key.toUpperCase()) {
			case 'NASDAQ':
			case 'IXIC':
				return MARKET_SYMBOLS.NASDAQ;
			case 'S&P500':
			case 'SPX':
				return MARKET_SYMBOLS['S&P500'];
			case 'DOW':
			case 'DJI':
				return MARKET_SYMBOLS.DOW;
			case 'RUSSELL':
			case 'RTY':
				return MARKET_SYMBOLS.RUSSELL;
			default:
				return null;
		}
	}
	return null;
} 