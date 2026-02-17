import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single goal by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const goal = await db.select()
        .from(goals)
        .where(eq(goals.id, parseInt(id)))
        .limit(1);

      if (goal.length === 0) {
        return NextResponse.json({ 
          error: 'Goal not found',
          code: "GOAL_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(goal[0], { status: 200 });
    }

    // List goals with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = db.select().from(goals);
    const conditions = [];

    // Filter by userId
    if (userId) {
      conditions.push(eq(goals.userId, parseInt(userId)));
    }

    // Filter by status
    if (status) {
      conditions.push(eq(goals.status, status));
    }

    // Filter by category
    if (category) {
      conditions.push(eq(goals.category, category));
    }

    // Search by title
    if (search) {
      conditions.push(like(goals.title, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(goals.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, target, current, unit, category, userId, deadline } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (target === undefined || target === null) {
      return NextResponse.json({ 
        error: "Target is required",
        code: "MISSING_TARGET" 
      }, { status: 400 });
    }

    if (current === undefined || current === null) {
      return NextResponse.json({ 
        error: "Current is required",
        code: "MISSING_CURRENT" 
      }, { status: 400 });
    }

    if (!unit) {
      return NextResponse.json({ 
        error: "Unit is required",
        code: "MISSING_UNIT" 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: "Category is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(target))) {
      return NextResponse.json({ 
        error: "Target must be a valid number",
        code: "INVALID_TARGET" 
      }, { status: 400 });
    }

    if (isNaN(parseFloat(current))) {
      return NextResponse.json({ 
        error: "Current must be a valid number",
        code: "INVALID_CURRENT" 
      }, { status: 400 });
    }

    // Prepare goal data
    const now = new Date().toISOString();
    const goalData: any = {
      title: title.trim(),
      target: parseFloat(target),
      current: parseFloat(current),
      unit: unit.trim(),
      category: category.trim(),
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields
    if (userId !== undefined && userId !== null) {
      goalData.userId = parseInt(userId);
    }

    if (deadline) {
      goalData.deadline = deadline;
    }

    const newGoal = await db.insert(goals)
      .values(goalData)
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if goal exists
    const existingGoal = await db.select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: "GOAL_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and add fields to update
    if (body.title !== undefined) {
      updates.title = body.title.trim();
    }

    if (body.target !== undefined) {
      if (isNaN(parseFloat(body.target))) {
        return NextResponse.json({ 
          error: "Target must be a valid number",
          code: "INVALID_TARGET" 
        }, { status: 400 });
      }
      updates.target = parseFloat(body.target);
    }

    if (body.current !== undefined) {
      if (isNaN(parseFloat(body.current))) {
        return NextResponse.json({ 
          error: "Current must be a valid number",
          code: "INVALID_CURRENT" 
        }, { status: 400 });
      }
      updates.current = parseFloat(body.current);
    }

    if (body.unit !== undefined) {
      updates.unit = body.unit.trim();
    }

    if (body.deadline !== undefined) {
      updates.deadline = body.deadline;
    }

    if (body.category !== undefined) {
      updates.category = body.category.trim();
    }

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.userId !== undefined) {
      updates.userId = parseInt(body.userId);
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    const updatedGoal = await db.update(goals)
      .set(updates)
      .where(eq(goals.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedGoal[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if goal exists
    const existingGoal = await db.select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Goal not found',
        code: "GOAL_NOT_FOUND" 
      }, { status: 404 });
    }

    const deletedGoal = await db.delete(goals)
      .where(eq(goals.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Goal deleted successfully',
      goal: deletedGoal[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}