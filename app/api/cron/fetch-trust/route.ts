import { NextRequest, NextResponse } from 'next/server';
import { fetchTrustScores } from '@/scripts/fetch-trust';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Verify cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await fetchTrustScores();
    return NextResponse.json({
      success: true,
      inserted: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron fetch-trust error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust scores', details: String(error) },
      { status: 500 }
    );
  }
}
