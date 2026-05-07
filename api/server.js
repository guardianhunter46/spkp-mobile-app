const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Database
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Set true jika pakai Azure
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Route Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Proses Hashing SHA-256
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('userParam', sql.VarChar, username)
            .input('passParam', sql.VarChar, passwordHash)
            .query('SELECT username, role, cabang, kocab, pelaksana FROM spkp_users WHERE username = @userParam AND password = @passParam');

        if (result.recordset.length > 0) {
            res.json({
                status: 'success',
                message: 'Login berhasil',
                user: result.recordset[0]
            });
        } else {
            res.status(401).json({ status: 'error', message: 'User atau Password salah' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API berjalan di http://localhost:${PORT}`);
});