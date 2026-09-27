import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import authRoutes from './routes/auth.routes';
import visitorRoutes from './routes/visitor.routes';
import parcelRoutes from './routes/parcel.routes';
import userRoutes from './routes/user.routes';
import preapproveRoutes from './routes/preapprove.routes';
import announcementRoutes from './routes/announcement.routes';
import frequentVisitorRoutes from './routes/frequent-visitor.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/preapprove', preapproveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/frequent-visitors', frequentVisitorRoutes);

// Health check with database connection test
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Server is running',
      database: 'Not Connected',
      error: (error as Error).message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health API: http://localhost:${PORT}/api/health`);
});
