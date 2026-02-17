import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .limit(1);

    if (exercise.length === 0) {
      return NextResponse.json(
        { error: 'Exercise not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise[0], { status: 200 });
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

    // Remove fields that shouldn't be updated
    const { id: _, createdAt, ...updateData } = body;

    // Check if exercise exists
    const existingExercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .limit(1);

    if (existingExercise.length === 0) {
      return NextResponse.json(
        { error: 'Exercise not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (updateData.name !== undefined && !updateData.name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Trim name if provided
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    // Validate numeric fields if provided
    if (updateData.sets !== undefined && (isNaN(updateData.sets) || updateData.sets < 0)) {
      return NextResponse.json(
        { error: 'Sets must be a positive number', code: 'INVALID_SETS' },
        { status: 400 }
      );
    }

    if (updateData.reps !== undefined && (isNaN(updateData.reps) || updateData.reps < 0)) {
      return NextResponse.json(
        { error: 'Reps must be a positive number', code: 'INVALID_REPS' },
        { status: 400 }
      );
    }

    if (updateData.weightLbs !== undefined && (isNaN(updateData.weightLbs) || updateData.weightLbs < 0)) {
      return NextResponse.json(
        { error: 'Weight must be a positive number', code: 'INVALID_WEIGHT' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(exercises)
      .set(updateData)
      .where(eq(exercises.id, parseInt(id)))
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

    // Check if exercise exists
    const existingExercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .limit(1);

    if (existingExercise.length === 0) {
      return NextResponse.json(
        { error: 'Exercise not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(exercises)
      .where(eq(exercises.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Exercise deleted successfully',
        exercise: deleted[0],
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