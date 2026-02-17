import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
import { eq, like, or, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single post by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const post = await db.select()
        .from(communityPosts)
        .where(eq(communityPosts.id, parseInt(id)))
        .limit(1);

      if (post.length === 0) {
        return NextResponse.json({ 
          error: 'Post not found',
          code: "POST_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(post[0], { status: 200 });
    }

    // List posts with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') ?? 'createdAt';
    const order = searchParams.get('order') ?? 'desc';

    let query = db.select().from(communityPosts);

    // Build where conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(communityPosts.userId, parseInt(userId)));
    }

    if (category) {
      conditions.push(eq(communityPosts.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(communityPosts.content, `%${search}%`),
          like(communityPosts.authorName, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sort === 'likes') {
      query = order === 'desc' 
        ? query.orderBy(desc(communityPosts.likes))
        : query.orderBy(asc(communityPosts.likes));
    } else {
      query = order === 'desc'
        ? query.orderBy(desc(communityPosts.createdAt))
        : query.orderBy(asc(communityPosts.createdAt));
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
    const { authorName, content, category, userId, authorAvatar } = body;

    // Validate required fields
    if (!authorName || authorName.trim() === '') {
      return NextResponse.json({ 
        error: "Author name is required",
        code: "MISSING_AUTHOR_NAME" 
      }, { status: 400 });
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    if (!category || category.trim() === '') {
      return NextResponse.json({ 
        error: "Category is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData: any = {
      authorName: authorName.trim(),
      content: content.trim(),
      category: category.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optional fields
    if (userId !== undefined && userId !== null) {
      sanitizedData.userId = parseInt(userId);
    }

    if (authorAvatar && authorAvatar.trim() !== '') {
      sanitizedData.authorAvatar = authorAvatar.trim();
    }

    const newPost = await db.insert(communityPosts)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
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

    // Check if post exists
    const existingPost = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: "POST_NOT_FOUND" 
      }, { status: 404 });
    }

    // Build update object (exclude id and likes from updates)
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Add fields if provided
    if (body.authorName !== undefined) {
      updates.authorName = body.authorName.trim();
    }

    if (body.content !== undefined) {
      updates.content = body.content.trim();
    }

    if (body.category !== undefined) {
      updates.category = body.category.trim();
    }

    if (body.userId !== undefined && body.userId !== null) {
      updates.userId = parseInt(body.userId);
    }

    if (body.authorAvatar !== undefined) {
      updates.authorAvatar = body.authorAvatar ? body.authorAvatar.trim() : null;
    }

    const updatedPost = await db.update(communityPosts)
      .set(updates)
      .where(eq(communityPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedPost[0], { status: 200 });
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

    // Check if post exists
    const existingPost = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: "POST_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Post deleted successfully',
      post: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}