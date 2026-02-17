import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }


) {
  try {
    const { userId } = await params;



    // Validate userId is a valid integer
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);
    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Extract sorting parameters
    const sort = searchParams.get('sort') ?? 'date';
    const order = searchParams.get('order') ?? 'desc';

    // Build query
    let query = db.select()
      .from(workouts)
      .where(eq(workouts.userId, userIdInt));

    // Apply sorting
    if (sort === 'date') {
      query = order === 'asc' 
        ? query.orderBy(asc(workouts.date))
        : query.orderBy(desc(workouts.date));
    } else {
      // Default to date desc if invalid sort parameter
      query = query.orderBy(desc(workouts.date));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET workouts error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}