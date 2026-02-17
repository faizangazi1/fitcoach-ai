import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { statsOverview } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      totalWorkouts, 
      caloriesBurned, 
      activeDays, 
      goalsAchieved, 
      goalsTotal 
    } = body;

    // Prepare insert data with defaults
    const insertData = {
      userId: userId ?? null,
      totalWorkouts: totalWorkouts ?? 0,
      caloriesBurned: caloriesBurned ?? 0,
      activeDays: activeDays ?? 0,
      goalsAchieved: goalsAchieved ?? 0,
      goalsTotal: goalsTotal ?? 0,
      lastUpdated: new Date().toISOString(),
    };

    const newStats = await db.insert(statsOverview)
      .values(insertData)
      .returning();

    return NextResponse.json(newStats[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(statsOverview)
      .where(eq(statsOverview.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Stats overview not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      userId, 
      totalWorkouts, 
      caloriesBurned, 
      activeDays, 
      goalsAchieved, 
      goalsTotal 
    } = body;

    // Prepare update data - only include provided fields
    const updateData: Record<string, any> = {
      lastUpdated: new Date().toISOString(),
    };

    if (userId !== undefined) updateData.userId = userId;
    if (totalWorkouts !== undefined) updateData.totalWorkouts = totalWorkouts;
    if (caloriesBurned !== undefined) updateData.caloriesBurned = caloriesBurned;
    if (activeDays !== undefined) updateData.activeDays = activeDays;
    if (goalsAchieved !== undefined) updateData.goalsAchieved = goalsAchieved;
    if (goalsTotal !== undefined) updateData.goalsTotal = goalsTotal;

    const updated = await db.update(statsOverview)
      .set(updateData)
      .where(eq(statsOverview.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}