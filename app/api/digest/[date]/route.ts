import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ date: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { date } = await params;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Filter by specific date
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const { data: digest, error } = await supabase
      .from('events')
      .select('*')
      .eq('type', 'digest')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json(
          { error: 'No digest found for this date', date },
          { status: 404 }
        );
      }
      console.error('Failed to fetch digest:', error);
      return NextResponse.json(
        { error: 'Failed to fetch digest', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ digest });
  } catch (error) {
    console.error('Digest fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digest', details: String(error) },
      { status: 500 }
    );
  }
}
