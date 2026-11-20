import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness probe: /api/healthz
 * Returns 200 if the Next.js App Router server process is alive.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'haq-ai',
      probe: 'liveness',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
