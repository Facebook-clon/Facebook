const express = require('express');
const supabaseAdmin = require('./supabaseClient');
const requireAuth = require('./auth');

const router = express.Router({ mergeParams: true });

// GET /api/posts/:postId/comments
router.get('/', requireAuth, async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('id, user_id, post_id, content, created_at, users(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ comments: data });
  } catch (err) {
    console.error('GET /comments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/posts/:postId/comments
router.post('/', requireAuth, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({ post_id: postId, user_id: req.user.id, content: content.trim() })
      .select('id, user_id, post_id, content, created_at, users(full_name, avatar_url)')
      .single();

    if (error) throw error;

    const { data: post } = await supabaseAdmin.from('posts').select('user_id').eq('id', postId).single();
    if (post && post.user_id !== req.user.id) {
      await supabaseAdmin.from('notifications').insert({
        recipient_id: post.user_id,
        sender_id: req.user.id,
        type: 'comment',
        post_id: postId,
        is_read: false,
      });
    }

    res.status(201).json({ comment });
  } catch (err) {
    console.error('POST /comments error:', err.message);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
