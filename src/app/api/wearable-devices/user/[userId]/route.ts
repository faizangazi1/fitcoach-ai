import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wearableDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
   {params }: { params: { userId: string }} 
) {
  try {
   const { userId } = await params;
 
    const { searchParams } = new URL(request.url);

    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');

    // Build query
    let query = db.select().from(wearableDevices);

    // Filter by userId
    if (status) {
      query = query.where(
        and(
          eq(wearableDevices.userId, userIdInt),
          eq(wearableDevices.status, status)
        )
      );
    } else {
      query = query.where(eq(wearableDevices.userId, userIdInt));
    }

    // Apply pagination
    const devices = await query.limit(limit).offset(offset);

    return NextResponse.json(devices, { status: 200 });
  } catch (error) {
    console.error('GET wearable devices error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}