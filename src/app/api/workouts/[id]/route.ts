import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const workout = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, user.id)))
      .limit(1);

    if (workout.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(workout[0], { status: 200 });
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const {
      workoutType,
      durationMinutes,
      caloriesBurned,
      date,
      notes,
    } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (workoutType !== undefined) {
      if (!workoutType || typeof workoutType !== 'string') {
        return NextResponse.json(
          { error: 'Valid workout type is required', code: 'INVALID_WORKOUT_TYPE' },
          { status: 400 }
        );
      }
      updates.workoutType = workoutType.trim();
    }

    if (durationMinutes !== undefined) {
      if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
        return NextResponse.json(
          { error: 'Valid duration in minutes is required', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
      updates.durationMinutes = durationMinutes;
    }

    if (caloriesBurned !== undefined) {
      if (caloriesBurned !== null && (typeof caloriesBurned !== 'number' || caloriesBurned < 0)) {
        return NextResponse.json(
          { error: 'Valid calories burned value is required', code: 'INVALID_CALORIES' },
          { status: 400 }
        );
      }
      updates.caloriesBurned = caloriesBurned;
    }

    if (date !== undefined) {
      if (!date || typeof date !== 'string') {
        return NextResponse.json(
          { error: 'Valid date is required', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
      updates.date = date;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    const updated = await db
      .update(workouts)
      .set(updates)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, user.id)))
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workout not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, user.id)))
      .returning();

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
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}