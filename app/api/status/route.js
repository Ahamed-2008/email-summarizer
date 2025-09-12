import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5000';
    const res = await fetch(`${WEBHOOK_URL}/status`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status || 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}


