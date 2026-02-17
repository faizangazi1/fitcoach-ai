import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { eq, like, or, lte, desc, asc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single challenge by ID
    if (id) {
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
    }

    // List challenges with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const daysLeftFilter = searchParams.get('daysLeft');
    const sortField = searchParams.get('sort') ?? 'createdAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    let query = db.select().from(challenges);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(challenges.title, `%${search}%`),
          like(challenges.description, `%${search}%`)
        )
      );
    }

    if (daysLeftFilter) {
      const daysLeftValue = parseInt(daysLeftFilter);
      if (!isNaN(daysLeftValue)) {
        conditions.push(lte(challenges.daysLeft, daysLeftValue));
      }
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const orderColumn = sortField === 'participantsCount' 
      ? challenges.participantsCount 
      : sortField === 'daysLeft'
      ? challenges.daysLeft
      : sortField === 'title'
      ? challenges.title
      : challenges.createdAt;

    query = query.orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

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
    const { title, description, daysLeft, reward } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (daysLeft === undefined || daysLeft === null || isNaN(parseInt(daysLeft))) {
      return NextResponse.json(
        { error: 'Days left is required and must be a valid number', code: 'MISSING_DAYS_LEFT' },
        { status: 400 }
      );
    }

    const daysLeftValue = parseInt(daysLeft);
    if (daysLeftValue < 0) {
      return NextResponse.json(
        { error: 'Days left must be a non-negative number', code: 'INVALID_DAYS_LEFT' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      title: title.trim(),
      description: description.trim(),
      daysLeft: daysLeftValue,
      participantsCount: 0,
      reward: reward && typeof reward === 'string' ? reward.trim() : null,
      createdAt: now,
      updatedAt: now,
    };

    const newChallenge = await db
      .insert(challenges)
      .values(insertData)
      .returning();

    return NextResponse.json(newChallenge[0], { status: 201 });
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

    const challengeId = parseInt(id);

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, daysLeft, participantsCount, reward } = body;

    // Validate fields if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return NextResponse.json(
        { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
      return NextResponse.json(
        { error: 'Description must be a non-empty string', code: 'INVALID_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (daysLeft !== undefined && (isNaN(parseInt(daysLeft)) || parseInt(daysLeft) < 0)) {
      return NextResponse.json(
        { error: 'Days left must be a non-negative number', code: 'INVALID_DAYS_LEFT' },
        { status: 400 }
      );
    }

    if (participantsCount !== undefined && (isNaN(parseInt(participantsCount)) || parseInt(participantsCount) < 0)) {
      return NextResponse.json(
        { error: 'Participants count must be a non-negative number', code: 'INVALID_PARTICIPANTS_COUNT' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (daysLeft !== undefined) updateData.daysLeft = parseInt(daysLeft);
    if (participantsCount !== undefined) updateData.participantsCount = parseInt(participantsCount);
    if (reward !== undefined) updateData.reward = reward && typeof reward === 'string' ? reward.trim() : null;

    const updatedChallenge = await db
      .update(challenges)
      .set(updateData)
      .where(eq(challenges.id, challengeId))
      .returning();

    return NextResponse.json(updatedChallenge[0], { status: 200 });
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

    const challengeId = parseInt(id);

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedChallenge = await db
      .delete(challenges)
      .where(eq(challenges.id, challengeId))
      .returning();

    return NextResponse.json(
      {
        message: 'Challenge deleted successfully',
        challenge: deletedChallenge[0],
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