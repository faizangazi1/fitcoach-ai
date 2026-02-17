import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leaderboard } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Leaderboard entry not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userIdFilter = searchParams.get('userId');

    let query = db.select().from(leaderboard);

    // Apply userId filter if provided
    if (userIdFilter) {
      const userId = parseInt(userIdFilter);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      query = query.where(eq(leaderboard.userId, userId));
    }

    // ALWAYS sort by points DESC (highest to lowest)
    const results = await query
      .orderBy(desc(leaderboard.points))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, rank, userId, userAvatar } = body;

    // Validate required fields
    if (!userName) {
      return NextResponse.json(
        { error: 'userName is required', code: 'MISSING_USER_NAME' },
        { status: 400 }
      );
    }

    if (rank === undefined || rank === null) {
      return NextResponse.json(
        { error: 'rank is required', code: 'MISSING_RANK' },
        { status: 400 }
      );
    }

    if (typeof rank !== 'number' || isNaN(rank)) {
      return NextResponse.json(
        { error: 'rank must be a valid number', code: 'INVALID_RANK' },
        { status: 400 }
      );
    }

    // Prepare insert data with auto-generated fields
    const insertData: any = {
      userName: userName.trim(),
      rank: rank,
      points: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (userId !== undefined && userId !== null) {
      insertData.userId = userId;
    }

    if (userAvatar) {
      insertData.userAvatar = userAvatar.trim();
    }

    const newRecord = await db.insert(leaderboard).values(insertData).returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Update allowed fields
    if (body.userName !== undefined) {
      updates.userName = body.userName.trim();
    }

    if (body.userAvatar !== undefined) {
      updates.userAvatar = body.userAvatar ? body.userAvatar.trim() : body.userAvatar;
    }

    if (body.userId !== undefined) {
      updates.userId = body.userId;
    }

    if (body.points !== undefined) {
      if (typeof body.points !== 'number' || isNaN(body.points)) {
        return NextResponse.json(
          { error: 'points must be a valid number', code: 'INVALID_POINTS' },
          { status: 400 }
        );
      }
      updates.points = body.points;
    }

    if (body.rank !== undefined) {
      if (typeof body.rank !== 'number' || isNaN(body.rank)) {
        return NextResponse.json(
          { error: 'rank must be a valid number', code: 'INVALID_RANK' },
          { status: 400 }
        );
      }
      updates.rank = body.rank;
    }

    const updated = await db
      .update(leaderboard)
      .set(updates)
      .where(eq(leaderboard.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Leaderboard entry deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}