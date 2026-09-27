import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { QueryResult } from 'pg';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(`
      SELECT vp.*, u.name as resident_name, u.flat_number, sg.name as guard_name
      FROM visitors_parcels vp
      LEFT JOIN users u ON vp.resident_id = u.id
      LEFT JOIN users sg ON vp.security_guard_id = sg.id
      WHERE vp.type = 'parcel'
      ORDER BY vp.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/resident/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const result: QueryResult = await pool.query(`
      SELECT vp.*, sg.name as guard_name
      FROM visitors_parcels vp
      LEFT JOIN users sg ON vp.security_guard_id = sg.id
      WHERE vp.type = 'parcel' AND vp.resident_id = $1
      ORDER BY vp.created_at DESC
    `, [residentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get resident parcels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { residentId, securityGuardId, name, description, media } = req.body;

    if (!residentId || !name) {
      return res.status(400).json({ error: 'Resident and parcel details are required' });
    }

    const result: QueryResult = await pool.query(
      `INSERT INTO visitors_parcels (resident_id, security_guard_id, type, name, description, media, status)
       VALUES ($1, $2, 'parcel', $3, $4, $5, 'Received') RETURNING id`,
      [residentId, securityGuardId || null, name, description || null, media || null]
    );

    res.status(201).json({ message: 'Parcel logged successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Log parcel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Received', 'Acknowledged', 'Entered', 'Exited', 'Collected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'Exited') {
      if (notes) {
        await pool.query(
          'UPDATE visitors_parcels SET status = $1, notes = $2, exit_time = NOW() WHERE id = $3 AND type = $4',
          [status, notes, id, 'parcel']
        );
      } else {
        await pool.query(
          'UPDATE visitors_parcels SET status = $1, exit_time = NOW() WHERE id = $2 AND type = $3',
          [status, id, 'parcel']
        );
      }
    } else {
      if (notes) {
        await pool.query(
          'UPDATE visitors_parcels SET status = $1, notes = $2 WHERE id = $3 AND type = $4',
          [status, notes, id, 'parcel']
        );
      } else {
        await pool.query(
          'UPDATE visitors_parcels SET status = $1 WHERE id = $2 AND type = $3',
          [status, id, 'parcel']
        );
      }
    }

    res.json({ message: 'Parcel status updated successfully' });
  } catch (error) {
    console.error('Update parcel status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history/recent', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(`
      SELECT vp.*, u.name as resident_name, u.flat_number
      FROM visitors_parcels vp
      LEFT JOIN users u ON vp.resident_id = u.id
      WHERE vp.type = 'parcel'
      ORDER BY vp.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get parcel history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
