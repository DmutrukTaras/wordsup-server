import express from 'express';
import cors, { CorsOptions } from 'cors';
import { config } from './config/config';
import { testDbConnection } from './config/db';
import authRoutes from './routes/auth';
import groupsRoutes from './routes/groups';
import wordsRoutes from './routes/words';
import externalRoutes from './routes/external';
import statsRoutes from './routes/stats';

import { authMiddleware } from './middleware/authMiddleware';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

      const allowed = [
        'http://localhost:5173',
         /\.loca\.lt$/.test(origin),
        config.clientUrl
      ];

      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
};


app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use('/api/groups', authMiddleware, groupsRoutes);
app.use('/api/words', authMiddleware, wordsRoutes);

app.use('/api/stats', statsRoutes);

// external helper APIs (no auth needed for now)
app.use('/api/external', externalRoutes);

const port = config.port;

app.listen(port, async () => {
  console.log(`Server listening on port-${port}`);
  try {
    await testDbConnection();
    console.log('DB connection OK');
  } catch (err) {
    console.error('DB connection FAILED', err);
  }
});
