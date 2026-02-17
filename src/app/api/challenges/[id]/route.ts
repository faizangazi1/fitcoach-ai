import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, parseInt(id)))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge[0], { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, parseInt(id)))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Add provided fields to update
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.participantsCount !== undefined) updateData.participantsCount = body.participantsCount;
    if (body.daysLeft !== undefined) updateData.daysLeft = body.daysLeft;
    if (body.reward !== undefined) updateData.reward = body.reward.trim();

    // Perform update
    const updated = await db
      .update(challenges)
      .set(updateData)
      .where(eq(challenges.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update challenge', code: 'UPDATE_FAILED' },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, parseInt(id)))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Perform delete
    const deleted = await db
      .delete(challenges)
      .where(eq(challenges.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete challenge', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Challenge deleted successfully',
        deletedChallenge: deleted[0],
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