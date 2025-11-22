const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/orders/webhook')) {
      req.rawBody = Buffer.from(buf);
    }
  },
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/orders', require('./routes/orders'));

app.use(errorMiddleware);

module.exports = app;
