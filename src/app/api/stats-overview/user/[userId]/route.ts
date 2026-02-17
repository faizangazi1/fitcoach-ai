import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { statsOverview } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }

) {
  try {
   const { userId } = await params;
 

    // Validate userId is a valid integer
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);

    // Query stats overview for the user
    const stats = await db.select()
      .from(statsOverview)
      .where(eq(statsOverview.userId, userIdInt))
      .limit(1);

    // Return 404 if no stats found for the user
    if (stats.length === 0) {
      return NextResponse.json(
        { 
          error: 'Stats overview not found for this user',
          code: 'STATS_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error('GET stats overview error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}