import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single workout by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const workout = await db
        .select()
        .from(workouts)
        .where(eq(workouts.id, parseInt(id)))
        .limit(1);

      if (workout.length === 0) {
        return NextResponse.json(
          { error: 'Workout not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(workout[0], { status: 200 });
    }

    // List workouts with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    let query = db.select().from(workouts);

    const conditions = [];

    // Add userId filter if provided
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(workouts.userId, parseInt(userId)));
    }

    // Add search filter if provided
    if (search) {
      const searchCondition = or(
        like(workouts.workoutType, `%${search}%`),
        like(workouts.notes, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workoutType, durationMinutes, date, userId, caloriesBurned, notes } = body;

    // Validate required fields
    if (!workoutType) {
      return NextResponse.json(
        { error: 'workoutType is required', code: 'MISSING_WORKOUT_TYPE' },
        { status: 400 }
      );
    }

    if (!durationMinutes) {
      return NextResponse.json(
        { error: 'durationMinutes is required', code: 'MISSING_DURATION' },
        { status: 400 }
      );
    }

    if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
      return NextResponse.json(
        { error: 'durationMinutes must be a positive number', code: 'INVALID_DURATION' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (caloriesBurned !== undefined && caloriesBurned !== null) {
      if (typeof caloriesBurned !== 'number' || caloriesBurned < 0) {
        return NextResponse.json(
          { error: 'caloriesBurned must be a non-negative number', code: 'INVALID_CALORIES' },
          { status: 400 }
        );
      }
    }

    if (userId !== undefined && userId !== null) {
      if (typeof userId !== 'number' || userId <= 0) {
        return NextResponse.json(
          { error: 'userId must be a positive number', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const insertData = {
      workoutType: workoutType.trim(),
      durationMinutes,
      date,
      userId: userId ?? null,
      caloriesBurned: caloriesBurned ?? null,
      notes: notes ? notes.trim() : null,
      createdAt: now,
      updatedAt: now,
    };

    const newWorkout = await db
      .insert(workouts)
      .values(insertData)
      .returning();

    return NextResponse.json(newWorkout[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { workoutType, durationMinutes, date, userId, caloriesBurned, notes } = body;

    // Check if workout exists
    const existingWorkout = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, parseInt(id)))
      .limit(1);

    if (existingWorkout.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate fields if provided
    if (durationMinutes !== undefined && durationMinutes !== null) {
      if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
        return NextResponse.json(
          { error: 'durationMinutes must be a positive number', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
    }

    if (caloriesBurned !== undefined && caloriesBurned !== null) {
      if (typeof caloriesBurned !== 'number' || caloriesBurned < 0) {
        return NextResponse.json(
          { error: 'caloriesBurned must be a non-negative number', code: 'INVALID_CALORIES' },
          { status: 400 }
        );
      }
    }

    if (userId !== undefined && userId !== null) {
      if (typeof userId !== 'number' || userId <= 0) {
        return NextResponse.json(
          { error: 'userId must be a positive number', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (workoutType !== undefined) updateData.workoutType = workoutType.trim();
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (date !== undefined) updateData.date = date;
    if (userId !== undefined) updateData.userId = userId;
    if (caloriesBurned !== undefined) updateData.caloriesBurned = caloriesBurned;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    const updated = await db
      .update(workouts)
      .set(updateData)
      .where(eq(workouts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if workout exists
    const existingWorkout = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, parseInt(id)))
      .limit(1);

    if (existingWorkout.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workouts)
      .where(eq(workouts.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Workout deleted successfully',
        workout: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}