import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 30 // Cache for 30 seconds
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ETH price: ${response.status}`);
    }

    const data = await response.json();
    // Transform to match the expected format
    return NextResponse.json({
      ethereum: {
        usd: parseFloat(data.price)
      }
    });
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETH price' },
      { status: 500 }
    );
  }
} 