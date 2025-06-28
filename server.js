const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, testConnection } = require('./database/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection test 
testConnection();

// API Routes

// GET /api/todos - Get all tasks
app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Błąd podczas pobierania zadań:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas pobierania zadań'
        });
    }
});

// POST /api/todos - Add new task
app.post('/api/todos', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Tytuł zadania jest wymagany'
            });
        }

        const result = await pool.query(
            'INSERT INTO todos (title) VALUES ($1) RETURNING *',
            [title.trim()]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Błąd podczas dodawania zadania:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas dodawania zadania'
        });
    }
});

// PUT /api/todos/:id - Update data
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        // Check if task exists
        const checkResult = await pool.query(
            'SELECT * FROM todos WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Zadanie nie znalezione'
            });
        }

        // Update task
        const result = await pool.query(
            'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
            [title, completed, id]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji zadania:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas aktualizacji zadania'
        });
    }
});

// DELETE /api/todos/:id - Delete task
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Zadanie nie znalezione'
            });
        }

        res.json({
            success: true,
            message: 'Zadanie zostało usunięte',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Błąd podczas usuwania zadania:', error);
        res.status(500).json({
            success: false,
            message: 'Błąd serwera podczas usuwania zadania'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Coś poszło nie tak!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint nie znaleziony'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
    console.log(`📱 Aplikacja dostępna pod: http://localhost:${PORT}`);
});