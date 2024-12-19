import express from "express";
import { Pool } from "pg";
import { Router } from "express";
import dotenv from "dotenv";

// Muat file .env
dotenv.config();

// Database connection
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: parseInt(process.env.PORT || '6543')
});

const router = Router();

// Types
interface TaskRecord {
    id: number;
    user_id: number;
    title: string;
    description: string;
    deadline: Date;
    is_completed: boolean;
    created_at: Date;
    updated_at: Date;
}

// Create new record
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, deadline } = req.body;

        // Konversi deadline ke ISO string
        const formattedDeadline = new Date(deadline).toISOString();

        const query = `INSERT INTO tasks (title, description, deadline) VALUES ($1, $2, $3) RETURNING *`;
        const values = [title, description, formattedDeadline];
        const result = await pool.query(query, values);

        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


// Get all records
router.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Get single record
router.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Update record
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, is_completed } = req.body;

        // Konversi deadline ke ISO string
        const formattedDeadline = new Date(deadline).toISOString();

        const query = `UPDATE tasks SET title = $1, description = $2, deadline = $3, is_completed = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`;
        const values = [title, description, formattedDeadline, is_completed, id];
        const result = await pool.query(query, values);

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Delete record
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Record deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});  

// Patch Record
router.patch('/tasks/:id/complete', async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body;

        // Validasi input
        if (is_completed !== true) {
            return res.status(400).json({
                status: 'error',
                message: 'Only true is allowed for is_completed',
                error_code: 'INVALID_IS_COMPLETED_VALUE',
            });
        }

        // Update record di database
        const result = await pool.query(
            'UPDATE tasks SET is_completed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_completed, id]
        );

        // Jika task tidak ditemukan
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Task with id ${id} not found`,
                error_code: 'TASK_NOT_FOUND',
            });
        }

        // Berhasil memperbarui task
        res.status(200).json({
            status: 'success',
            data: result.rows[0],
        });
    } catch (err: any) {
        // Error umum
        res.status(500).json({
            status: 'error',
            message: err.message,
            error_code: 'INTERNAL_SERVER_ERROR',
        });
    }
});

// Types
interface UserRecord {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: Date;
}

// Create new record
router.post('/tasks', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const query = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *`;
        const values = [username, email, password];
        const result = await pool.query(query, values);
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}); 

// Get all records
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Get single record
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Update record
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;   
        const values =  { username, email, password };
        const result = await pool.query('UPDATE users SET username, email, password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [values, id]
    );
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Delete record
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Record deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});  

export default router;