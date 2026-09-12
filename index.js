require('dotenv').config();
const express = require('express');
const cors = require('cors');

const postsRouter = require('./src/routes/posts');
const commentsRouter = require('./src/routes/comments');
const notificationsRouter = require('./src/routes/notifications');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check — useful for Render's health checks and quick manual testing
app.get('/', (req, res) => res.json({ status: 'ok', service: 'social-app-server' }));

app.use('/api/posts', postsRouter);
app.use('/api/posts/:postId/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler (catches anything thrown outside try/catch in routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
