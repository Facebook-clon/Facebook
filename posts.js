const express = require('express');
const supabaseAdmin = require('../supabaseClient');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/posts?cursor=<ISO date>&limit=10
router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const cursor = req.query.cursor || null;

  try {
    let query = supabaseAdmin
      .from('posts')
      .select('id, user_id, content, image_url, created_at, users(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    const hasMore = posts.length > limit;
    const pageItems = hasMore ? posts.slice(0, limit) : posts;
    const postIds = pageItems.map((p) => p.id);

    // Batch-fetch likes/comments counts and whether the current user liked each post
    const [{ data: likeRows }, { data: commentRows }, { data: myLikes }] = await Promise.all([
      postIds.length
        ? supabaseAdmin.from('likes').select('post_id').in('post_id', postIds)
        : { data: [] },
      postIds.length
        ? supabaseAdmin.from('comments').select('post_id').in('post_id', postIds)
        : { data: [] },
      postIds.length
        ? supabaseAdmin.from('likes').select('post_id').eq('user_id', req.user.id).in('post_id', postIds)
        : { data: [] },
    ]);

    const likeCounts = {};
    (likeRows || []).forEach((l) => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
    const commentCounts = {};
    (commentRows || []).forEach((c) => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });
    const likedSet = new Set((myLikes || []).map((l) => l.post_id));

    const enriched = pageItems.map((p) => ({
      ...p,
      likesCount: likeCounts[p.id] || 0,
      commentsCount: commentCounts[p.id] || 0,
      isLikedByMe: likedSet.has(p.id),
    }));

    res.json({
      posts: enriched,
      nextCursor: hasMore ? pageItems[pageItems.length - 1].created_at : null,
      hasMore,
    });
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts
router.post('/', requireAuth, async (req, res) => {
  const { content, image_url } = req.body;

  if (!content?.trim() && !image_url) {
    return res.status(400).json({ error: 'Post must have content or an image' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({ user_id: req.user.id, content: content?.trim() || '', image_url: image_url || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ post: data });
  } catch (err) {
    console.error('POST /posts error:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/like  (toggles like on/off)
router.post('/:id/like', requireAuth, async (req, res) => {
  const postId = req.params.id;

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { error: delError } = await supabaseAdmin.from('likes').delete().eq('id', existing.id);
      if (delError) throw delError;
      return res.json({ liked: false });
    }

    const { error: insError } = await supabaseAdmin
      .from('likes')
      .insert({ post_id: postId, user_id: req.user.id });
    if (insError) throw insError;

    // Notify the post owner (skip if liking your own post)
    const { data: post } = await supabaseAdmin.from('posts').select('user_id').eq('id', postId).single();
    if (post && post.user_id !== req.user.id) {
      await supabaseAdmin.from('notifications').insert({
        recipient_id: post.user_id,
        sender_id: req.user.id,
        type: 'like',
        post_id: postId,
        is_read: false,
      });
    }

    res.json({ liked: true });
  } catch (err) {
    console.error('POST /posts/:id/like error:', err.message);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
