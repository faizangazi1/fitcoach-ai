import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }

) {
  try {
   const { userId } = await params; 
    const { searchParams } = new URL(request.url);

    // Validate userId
    const parsedUserId = parseInt(userId);
    if (!userId || isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        },
        { status: 400 }
      );
    }

    // Extract query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') ?? 'createdAt';
    const order = searchParams.get('order') ?? 'desc';

    // Build query
    let query = db.select().from(goals);

    // Apply userId filter
    const conditions = [eq(goals.userId, parsedUserId)];

    // Apply status filter if provided
    if (status) {
      conditions.push(eq(goals.status, status));
    }

    // Apply WHERE conditions
    query = query.where(and(...conditions));

    // Apply sorting
    const sortColumn = sort === 'deadline' ? goals.deadline :
                      sort === 'title' ? goals.title :
                      sort === 'status' ? goals.status :
                      sort === 'category' ? goals.category :
                      sort === 'target' ? goals.target :
                      sort === 'current' ? goals.current :
                      sort === 'updatedAt' ? goals.updatedAt :
                      goals.createdAt;

    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute query
    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}