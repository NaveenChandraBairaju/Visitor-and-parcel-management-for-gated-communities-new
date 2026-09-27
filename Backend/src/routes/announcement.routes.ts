import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { QueryResult } from 'pg';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result: QueryResult = await pool.query(`
      SELECT a.*, u.name as created_by_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/audience/:audience', async (req: Request, res: Response) => {
  try {
    const { audience } = req.params;
    const result: QueryResult = await pool.query(`
      SELECT a.*, u.name as created_by_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.audience = 'All' OR a.audience = $1
      ORDER BY a.priority DESC, a.created_at DESC
    `, [audience]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements by audience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, message, audience, priority, createdBy } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const result: QueryResult = await pool.query(
      `INSERT INTO announcements (title, message, audience, priority, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, message, audience || 'All', priority || 'normal', createdBy || null]
    );

    res.status(201).json({ message: 'Announcement created successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
