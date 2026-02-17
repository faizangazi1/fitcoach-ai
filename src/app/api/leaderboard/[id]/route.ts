import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leaderboard } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const entry = await db.select()
      .from(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if entry exists
    const existing = await db.select()
      .from(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard entry not found' },
        { status: 404 }
      );
    }

    // Validate points if provided
    if (body.points !== undefined && typeof body.points !== 'number') {
      return NextResponse.json(
        { 
          error: 'Points must be a number',
          code: 'INVALID_POINTS' 
        },
        { status: 400 }
      );
    }

    // Validate rank if provided
    if (body.rank !== undefined && typeof body.rank !== 'number') {
      return NextResponse.json(
        { 
          error: 'Rank must be a number',
          code: 'INVALID_RANK' 
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Add fields from request body
    if (body.userName !== undefined) updateData.userName = body.userName.trim();
    if (body.userAvatar !== undefined) updateData.userAvatar = body.userAvatar.trim();
    if (body.points !== undefined) updateData.points = body.points;
    if (body.rank !== undefined) updateData.rank = body.rank;

    const updated = await db.update(leaderboard)
      .set(updateData)
      .where(eq(leaderboard.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update leaderboard entry' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if entry exists
    const existing = await db.select()
      .from(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard entry not found' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(leaderboard)
      .where(eq(leaderboard.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete leaderboard entry' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Leaderboard entry deleted successfully',
        entry: deleted[0]
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