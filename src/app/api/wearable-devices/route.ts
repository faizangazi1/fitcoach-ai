import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wearableDevices } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single device by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const device = await db.select()
        .from(wearableDevices)
        .where(eq(wearableDevices.id, parseInt(id)))
        .limit(1);

      if (device.length === 0) {
        return NextResponse.json({ 
          error: 'Device not found',
          code: 'DEVICE_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(device[0], { status: 200 });
    }

    // List devices with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = db.select().from(wearableDevices);

    // Build filter conditions
    const conditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(wearableDevices.userId, parseInt(userId)));
    }

    if (status) {
      conditions.push(eq(wearableDevices.status, status));
    }

    if (search) {
      conditions.push(like(wearableDevices.deviceName, `%${search}%`));
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

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
    const { deviceName, deviceType, userId, lastSync } = body;

    // Validate required fields
    if (!deviceName || typeof deviceName !== 'string' || deviceName.trim() === '') {
      return NextResponse.json({ 
        error: "Device name is required and must be a non-empty string",
        code: "MISSING_DEVICE_NAME" 
      }, { status: 400 });
    }

    if (!deviceType || typeof deviceType !== 'string' || deviceType.trim() === '') {
      return NextResponse.json({ 
        error: "Device type is required and must be a non-empty string",
        code: "MISSING_DEVICE_TYPE" 
      }, { status: 400 });
    }

    // Validate userId if provided
    if (userId !== undefined && userId !== null) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "userId must be a valid integer",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData: any = {
      deviceName: deviceName.trim(),
      deviceType: deviceType.trim(),
      status: 'connected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optional fields
    if (userId !== undefined && userId !== null) {
      insertData.userId = parseInt(userId);
    }

    if (lastSync) {
      insertData.lastSync = lastSync;
    }

    const newDevice = await db.insert(wearableDevices)
      .values(insertData)
      .returning();

    return NextResponse.json(newDevice[0], { status: 201 });
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

    // Check if device exists
    const existingDevice = await db.select()
      .from(wearableDevices)
      .where(eq(wearableDevices.id, parseInt(id)))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({ 
        error: 'Device not found',
        code: 'DEVICE_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { deviceName, deviceType, userId, status, lastSync } = body;

    // Validate fields if provided
    if (deviceName !== undefined && (typeof deviceName !== 'string' || deviceName.trim() === '')) {
      return NextResponse.json({ 
        error: "Device name must be a non-empty string",
        code: "INVALID_DEVICE_NAME" 
      }, { status: 400 });
    }

    if (deviceType !== undefined && (typeof deviceType !== 'string' || deviceType.trim() === '')) {
      return NextResponse.json({ 
        error: "Device type must be a non-empty string",
        code: "INVALID_DEVICE_TYPE" 
      }, { status: 400 });
    }

    if (userId !== undefined && userId !== null && isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "userId must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (deviceName !== undefined) {
      updateData.deviceName = deviceName.trim();
    }

    if (deviceType !== undefined) {
      updateData.deviceType = deviceType.trim();
    }

    if (userId !== undefined) {
      updateData.userId = userId !== null ? parseInt(userId) : null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (lastSync !== undefined) {
      updateData.lastSync = lastSync;
    }

    const updated = await db.update(wearableDevices)
      .set(updateData)
      .where(eq(wearableDevices.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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

    // Check if device exists
    const existingDevice = await db.select()
      .from(wearableDevices)
      .where(eq(wearableDevices.id, parseInt(id)))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({ 
        error: 'Device not found',
        code: 'DEVICE_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(wearableDevices)
      .where(eq(wearableDevices.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Device deleted successfully',
      device: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}