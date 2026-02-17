import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weightHistory } from '@/db/schema';
import { eq, gte, lte, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(weightHistory)
        .where(eq(weightHistory.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Weight history record not found',
          code: "RECORD_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortField = searchParams.get('sort') ?? 'recordedDate';
    const sortOrder = searchParams.get('order') ?? 'desc';

    let query = db.select().from(weightHistory);

    const conditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(weightHistory.userId, parseInt(userId)));
    }

    if (startDate) {
      conditions.push(gte(weightHistory.recordedDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(weightHistory.recordedDate, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (sortField === 'recordedDate') {
      query = sortOrder === 'asc' 
        ? query.orderBy(asc(weightHistory.recordedDate))
        : query.orderBy(desc(weightHistory.recordedDate));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weightLbs, recordedDate, userId } = body;

    if (!weightLbs) {
      return NextResponse.json({ 
        error: "weightLbs is required",
        code: "MISSING_WEIGHT" 
      }, { status: 400 });
    }

    if (typeof weightLbs !== 'number' || weightLbs <= 0) {
      return NextResponse.json({ 
        error: "weightLbs must be a positive number",
        code: "INVALID_WEIGHT" 
      }, { status: 400 });
    }

    if (!recordedDate) {
      return NextResponse.json({ 
        error: "recordedDate is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (typeof recordedDate !== 'string' || recordedDate.trim() === '') {
      return NextResponse.json({ 
        error: "recordedDate must be a valid date string",
        code: "INVALID_DATE" 
      }, { status: 400 });
    }

    const insertData: any = {
      weightLbs,
      recordedDate: recordedDate.trim(),
      createdAt: new Date().toISOString()
    };

    if (userId !== undefined && userId !== null) {
      if (typeof userId !== 'number' || isNaN(userId)) {
        return NextResponse.json({ 
          error: "userId must be a valid number",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      insertData.userId = userId;
    }

    const newRecord = await db.insert(weightHistory)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Weight history record not found',
        code: "RECORD_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { weightLbs, recordedDate } = body;

    const updates: any = {};

    if (weightLbs !== undefined) {
      if (typeof weightLbs !== 'number' || weightLbs <= 0) {
        return NextResponse.json({ 
          error: "weightLbs must be a positive number",
          code: "INVALID_WEIGHT" 
        }, { status: 400 });
      }
      updates.weightLbs = weightLbs;
    }

    if (recordedDate !== undefined) {
      if (typeof recordedDate !== 'string' || recordedDate.trim() === '') {
        return NextResponse.json({ 
          error: "recordedDate must be a valid date string",
          code: "INVALID_DATE" 
        }, { status: 400 });
      }
      updates.recordedDate = recordedDate.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(weightHistory)
      .set(updates)
      .where(eq(weightHistory.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Weight history record not found',
        code: "RECORD_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(weightHistory)
      .where(eq(weightHistory.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Weight history record deleted successfully',
      record: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}