import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weightHistory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const record = await db
      .select()
      .from(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json(
        { error: 'Weight history record not found', code: 'RECORD_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(record[0], { status: 200 });
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
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Weight history record not found', code: 'RECORD_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data - only allow weightLbs and recordedDate
    const updates: {
      weightLbs?: number;
      recordedDate?: string;
    } = {};

    if (body.weightLbs !== undefined) {
      if (typeof body.weightLbs !== 'number' || body.weightLbs <= 0) {
        return NextResponse.json(
          {
            error: 'Weight must be a positive number',
            code: 'INVALID_WEIGHT',
          },
          { status: 400 }
        );
      }
      updates.weightLbs = body.weightLbs;
    }

    if (body.recordedDate !== undefined) {
      if (typeof body.recordedDate !== 'string' || !body.recordedDate.trim()) {
        return NextResponse.json(
          {
            error: 'Recorded date must be a valid date string',
            code: 'INVALID_DATE',
          },
          { status: 400 }
        );
      }
      updates.recordedDate = body.recordedDate.trim();
    }

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields to update',
          code: 'NO_UPDATES',
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(weightHistory)
      .set(updates)
      .where(eq(weightHistory.id, parseInt(id)))
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Weight history record not found', code: 'RECORD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Weight history record deleted successfully',
        record: deleted[0],
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