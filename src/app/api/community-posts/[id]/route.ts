import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const post = await db
      .select()
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, parseInt(id)),
          eq(communityPosts.userId, user.id)
        )
      )
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(post[0], { status: 200 });
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

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

    if ('likes' in body) {
      return NextResponse.json(
        {
          error: 'Likes cannot be updated through this endpoint',
          code: 'LIKES_UPDATE_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingPost = await db
      .select()
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, parseInt(id)),
          eq(communityPosts.userId, user.id)
        )
      )
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: {
      authorName?: string;
      authorAvatar?: string;
      content?: string;
      category?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (body.authorName !== undefined) {
      if (typeof body.authorName !== 'string' || !body.authorName.trim()) {
        return NextResponse.json(
          { error: 'Author name must be a non-empty string', code: 'INVALID_AUTHOR_NAME' },
          { status: 400 }
        );
      }
      updates.authorName = body.authorName.trim();
    }

    if (body.authorAvatar !== undefined) {
      updates.authorAvatar = body.authorAvatar;
    }

    if (body.content !== undefined) {
      if (typeof body.content !== 'string' || !body.content.trim()) {
        return NextResponse.json(
          { error: 'Content must be a non-empty string', code: 'INVALID_CONTENT' },
          { status: 400 }
        );
      }
      updates.content = body.content.trim();
    }

    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || !body.category.trim()) {
        return NextResponse.json(
          { error: 'Category must be a non-empty string', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = body.category.trim();
    }

    const updated = await db
      .update(communityPosts)
      .set(updates)
      .where(
        and(
          eq(communityPosts.id, parseInt(id)),
          eq(communityPosts.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update post', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingPost = await db
      .select()
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, parseInt(id)),
          eq(communityPosts.userId, user.id)
        )
      )
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(communityPosts)
      .where(
        and(
          eq(communityPosts.id, parseInt(id)),
          eq(communityPosts.userId, user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete post', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Post deleted successfully',
        post: deleted[0],
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