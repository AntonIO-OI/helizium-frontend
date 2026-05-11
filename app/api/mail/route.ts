import { NextResponse } from 'next/server';

// Email sending is now handled by the auth microservice directly.
// This route is kept for backwards compatibility but does nothing.
export async function POST() {
  return NextResponse.json(
    { message: 'Email sending is handled by the auth service directly.' },
    { status: 200 },
  );
}
