import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const exercise = await db.select()
        .from(exercises)
        .where(eq(exercises.id, parseInt(id)))
        .limit(1);

      if (exercise.length === 0) {
        return NextResponse.json({ 
          error: 'Exercise not found',
          code: "EXERCISE_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(exercise[0], { status: 200 });
    }

    // List with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const workoutId = searchParams.get('workoutId');

    let query = db.select().from(exercises);

    const conditions = [];

    if (workoutId) {
      if (isNaN(parseInt(workoutId))) {
        return NextResponse.json({ 
          error: "Valid workoutId is required",
          code: "INVALID_WORKOUT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(exercises.workoutId, parseInt(workoutId)));
    }

    if (search) {
      conditions.push(like(exercises.name, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(exercises.createdAt))
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
    const { name, workoutId, sets, reps, weightLbs } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Validate optional fields
    if (workoutId !== undefined && workoutId !== null) {
      if (typeof workoutId !== 'number' || isNaN(workoutId)) {
        return NextResponse.json({ 
          error: "WorkoutId must be a valid number",
          code: "INVALID_WORKOUT_ID" 
        }, { status: 400 });
      }
    }

    if (sets !== undefined && sets !== null) {
      if (typeof sets !== 'number' || isNaN(sets) || sets < 0) {
        return NextResponse.json({ 
          error: "Sets must be a valid non-negative number",
          code: "INVALID_SETS" 
        }, { status: 400 });
      }
    }

    if (reps !== undefined && reps !== null) {
      if (typeof reps !== 'number' || isNaN(reps) || reps < 0) {
        return NextResponse.json({ 
          error: "Reps must be a valid non-negative number",
          code: "INVALID_REPS" 
        }, { status: 400 });
      }
    }

    if (weightLbs !== undefined && weightLbs !== null) {
      if (typeof weightLbs !== 'number' || isNaN(weightLbs) || weightLbs < 0) {
        return NextResponse.json({ 
          error: "WeightLbs must be a valid non-negative number",
          code: "INVALID_WEIGHT" 
        }, { status: 400 });
      }
    }

    const newExercise = await db.insert(exercises)
      .values({
        name: name.trim(),
        workoutId: workoutId ?? null,
        sets: sets ?? null,
        reps: reps ?? null,
        weightLbs: weightLbs ?? null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newExercise[0], { status: 201 });

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

    const body = await request.json();
    const { name, workoutId, sets, reps, weightLbs } = body;

    // Check if exercise exists
    const existingExercise = await db.select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .limit(1);

    if (existingExercise.length === 0) {
      return NextResponse.json({ 
        error: 'Exercise not found',
        code: "EXERCISE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate fields if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
    }

    if (workoutId !== undefined && workoutId !== null) {
      if (typeof workoutId !== 'number' || isNaN(workoutId)) {
        return NextResponse.json({ 
          error: "WorkoutId must be a valid number",
          code: "INVALID_WORKOUT_ID" 
        }, { status: 400 });
      }
    }

    if (sets !== undefined && sets !== null) {
      if (typeof sets !== 'number' || isNaN(sets) || sets < 0) {
        return NextResponse.json({ 
          error: "Sets must be a valid non-negative number",
          code: "INVALID_SETS" 
        }, { status: 400 });
      }
    }

    if (reps !== undefined && reps !== null) {
      if (typeof reps !== 'number' || isNaN(reps) || reps < 0) {
        return NextResponse.json({ 
          error: "Reps must be a valid non-negative number",
          code: "INVALID_REPS" 
        }, { status: 400 });
      }
    }

    if (weightLbs !== undefined && weightLbs !== null) {
      if (typeof weightLbs !== 'number' || isNaN(weightLbs) || weightLbs < 0) {
        return NextResponse.json({ 
          error: "WeightLbs must be a valid non-negative number",
          code: "INVALID_WEIGHT" 
        }, { status: 400 });
      }
    }

    const updates: Record<string, any> = {};
    
    if (name !== undefined) updates.name = name.trim();
    if (workoutId !== undefined) updates.workoutId = workoutId;
    if (sets !== undefined) updates.sets = sets;
    if (reps !== undefined) updates.reps = reps;
    if (weightLbs !== undefined) updates.weightLbs = weightLbs;

    const updatedExercise = await db.update(exercises)
      .set(updates)
      .where(eq(exercises.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedExercise[0], { status: 200 });

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

    // Check if exercise exists
    const existingExercise = await db.select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .limit(1);

    if (existingExercise.length === 0) {
      return NextResponse.json({ 
        error: 'Exercise not found',
        code: "EXERCISE_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Exercise deleted successfully',
      exercise: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}