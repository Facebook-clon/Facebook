const express = require('express');
const supabaseAdmin = require('./supabaseClient');
const requireAuth = require('./auth');

const router = express.Router();

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id, sender_id, type, post_id, is_read, created_at, sender:sender_id(full_name, avatar_url)')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ notifications: data });
  } catch (err) {
    console.error('GET /notifications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('recipient_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /notifications/:id/read error:', err.message);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;
