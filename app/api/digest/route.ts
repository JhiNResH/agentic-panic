import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    let query = supabase
      .from('events')
      .select('*')
      .eq('type', 'digest')
      .order('created_at', { ascending: false });

    if (date) {
      // Filter by specific date
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data: digest, error } = await query.limit(1).single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json(
          { error: 'No digest found', date: date || 'latest' },
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
