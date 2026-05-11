import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) throw new Error(`Binance API error: ${response.status}`);

    const data = await response.json();
    return NextResponse.json({ ethereum: { usd: parseFloat(data.price) } });
  } catch {
    // Try CoinGecko as fallback
    try {
      const fallback = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        { next: { revalidate: 60 } },
      );
      if (fallback.ok) {
        const data = await fallback.json();
        return NextResponse.json({ ethereum: { usd: data.ethereum?.usd || 0 } });
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ error: 'Failed to fetch ETH price' }, { status: 500 });
  }
}
