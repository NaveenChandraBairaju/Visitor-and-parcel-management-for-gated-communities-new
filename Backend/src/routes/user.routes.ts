import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { QueryResult } from 'pg';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(
      'SELECT id, name, email, role, contact_info, flat_number, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/residents', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(
      'SELECT id, name, flat_number, contact_info FROM users WHERE role = $1 ORDER BY flat_number',
      ['resident']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result: QueryResult = await pool.query(
      'SELECT id, name, email, role, contact_info, flat_number, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/dashboard', async (_req: Request, res: Response) => {
  try {
    const userCount: QueryResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const visitorCount: QueryResult = await pool.query("SELECT COUNT(*) as count FROM visitors_parcels WHERE type = 'visitor'");
    const parcelCount: QueryResult = await pool.query("SELECT COUNT(*) as count FROM visitors_parcels WHERE type = 'parcel'");
    const pendingVisitors: QueryResult = await pool.query("SELECT COUNT(*) as count FROM visitors_parcels WHERE type = 'visitor' AND status IN ('New', 'Waiting for Approval')");
    const pendingParcels: QueryResult = await pool.query("SELECT COUNT(*) as count FROM visitors_parcels WHERE type = 'parcel' AND status = 'Received'");

    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalVisitors: parseInt(visitorCount.rows[0].count),
      totalParcels: parseInt(parcelCount.rows[0].count),
      pendingVisitors: parseInt(pendingVisitors.rows[0].count),
      pendingParcels: parseInt(pendingParcels.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
