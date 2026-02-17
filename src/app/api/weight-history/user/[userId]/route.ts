import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weightHistory } from '@/db/schema';
import { eq, gte, lte, and, desc, asc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }

) {
  try {
   const { userId } = await params;
 
    const { searchParams } = new URL(request.url);

    // Validate userId
    const userIdNum = parseInt(userId);
    if (!userId || isNaN(userIdNum)) {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Date range filtering
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Sorting parameters
    const sortField = searchParams.get('sort') ?? 'recordedDate';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Validate date parameters if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { 
          error: 'Invalid start date format',
          code: 'INVALID_START_DATE' 
        },
        { status: 400 }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { 
          error: 'Invalid end date format',
          code: 'INVALID_END_DATE' 
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(weightHistory.userId, userIdNum)];

    if (startDate) {
      conditions.push(gte(weightHistory.recordedDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(weightHistory.recordedDate, endDate));
    }

    // Determine sort order
    const orderBy = sortOrder.toLowerCase() === 'asc' 
      ? asc(weightHistory.recordedDate)
      : desc(weightHistory.recordedDate);

    // Execute query
    const records = await db
      .select()
      .from(weightHistory)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(records, { status: 200 });

  } catch (error) {
    console.error('GET weight history error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}