import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { QueryResult } from 'pg';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(`
      SELECT pav.*, u.name as resident_name, u.flat_number
      FROM pre_approved_visitors pav
      JOIN users u ON pav.resident_id = u.id
      WHERE pav.status NOT IN ('Exited', 'Cancelled')
      ORDER BY pav.expected_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get pre-approved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(`
      SELECT pav.*, u.name as resident_name, u.flat_number
      FROM pre_approved_visitors pav
      JOIN users u ON pav.resident_id = u.id
      ORDER BY pav.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get pre-approved history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/resident/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const result: QueryResult = await pool.query(`
      SELECT * FROM pre_approved_visitors
      WHERE resident_id = $1
      ORDER BY created_at DESC
    `, [residentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get resident pre-approved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { residentId, name, phone, purpose, expectedDate, vehicleNumber } = req.body;

    if (!residentId || !name || !phone || !purpose || !expectedDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result: QueryResult = await pool.query(
      `INSERT INTO pre_approved_visitors (resident_id, name, phone, purpose, expected_date, vehicle_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active') RETURNING id`,
      [residentId, name, phone, purpose, expectedDate, vehicleNumber || null]
    );

    res.status(201).json({ message: 'Pre-approval added successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Add pre-approved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating pre-approved id:', id, 'to status:', status);

    const result: QueryResult = await pool.query(
      'UPDATE pre_approved_visitors SET status = $1 WHERE id = $2',
      [status, id]
    );

    console.log('Update result:', result);

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update pre-approved status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pre_approved_visitors WHERE id = $1', [id]);
    res.json({ message: 'Pre-approval deleted successfully' });
  } catch (error) {
    console.error('Delete pre-approved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
