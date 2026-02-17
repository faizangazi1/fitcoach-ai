import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
) {
  try {
    const { workoutId } = params;

    // Validate workoutId is a valid integer
    if (!workoutId || isNaN(parseInt(workoutId))) {
      return NextResponse.json(
        { 
          error: "Valid workout ID is required",
          code: "INVALID_WORKOUT_ID" 
        },
        { status: 400 }
      );
    }

    const workoutIdInt = parseInt(workoutId);

    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query exercises for the specific workout with pagination
    const workoutExercises = await db
      .select()
      .from(exercises)
      .where(eq(exercises.workoutId, workoutIdInt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(workoutExercises, { status: 200 });
  } catch (error) {
    console.error('GET exercises error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}