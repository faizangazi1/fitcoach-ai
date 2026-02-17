import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const goal = await db.select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (goal.length === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(goal[0], { status: 200 });
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
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED" 
        },
        { status: 400 }
      );
    }

    // Check if goal exists
    const existing = await db.select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Add only provided fields to update
    if (body.title !== undefined) {
      if (!body.title || body.title.trim() === '') {
        return NextResponse.json(
          { 
            error: "Title cannot be empty",
            code: "INVALID_TITLE" 
          },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.target !== undefined) {
      if (typeof body.target !== 'number' || body.target <= 0) {
        return NextResponse.json(
          { 
            error: "Target must be a positive number",
            code: "INVALID_TARGET" 
          },
          { status: 400 }
        );
      }
      updateData.target = body.target;
    }

    if (body.current !== undefined) {
      if (typeof body.current !== 'number' || body.current < 0) {
        return NextResponse.json(
          { 
            error: "Current must be a non-negative number",
            code: "INVALID_CURRENT" 
          },
          { status: 400 }
        );
      }
      updateData.current = body.current;
    }

    if (body.unit !== undefined) {
      if (!body.unit || body.unit.trim() === '') {
        return NextResponse.json(
          { 
            error: "Unit cannot be empty",
            code: "INVALID_UNIT" 
          },
          { status: 400 }
        );
      }
      updateData.unit = body.unit.trim();
    }

    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline;
    }

    if (body.category !== undefined) {
      if (!body.category || body.category.trim() === '') {
        return NextResponse.json(
          { 
            error: "Category cannot be empty",
            code: "INVALID_CATEGORY" 
          },
          { status: 400 }
        );
      }
      updateData.category = body.category.trim();
    }

    if (body.status !== undefined) {
      const validStatuses = ['in_progress', 'completed', 'abandoned'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { 
            error: "Status must be one of: in_progress, completed, abandoned",
            code: "INVALID_STATUS" 
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    const updated = await db.update(goals)
      .set(updateData)
      .where(eq(goals.id, parseInt(id)))
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
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    // Check if goal exists
    const existing = await db.select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(goals)
      .where(eq(goals.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Goal deleted successfully',
        goal: deleted[0]
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