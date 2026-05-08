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

const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi MySQL menggunakan data dari .env
const mysqlConfig = {
    host: process.env.MY_HOST,
    user: process.env.MY_USER,
    password: process.env.MY_PWD,
    database: process.env.MY_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Inisialisasi Pool MySQL
const mysqlPool = mysql.createPool(mysqlConfig);

// Cek koneksi MySQL saat server jalan
mysqlPool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Connected to: ' + process.env.MY_NAME);
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Failed:', err.message);
    });

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

//Route List User
app.get('/users', async (req, res) => {
    try {
        const { cabang } = req.query;
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('cabangParam', sql.VarChar, cabang)
            .query('SELECT username, role, pelaksana, cabang, kocab FROM spkp_users WHERE cabang = @cabangParam');

        res.json({ status: 'success', data: result.recordset });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Endpoint untuk mengambil daftar cabang unik
app.get('/list-cabang', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // Mengambil data unik dari kolom cabang di view vCabang
        let result = await pool.request()
            .query('SELECT DISTINCT kocab, cabang FROM vCabang WHERE cabang IS NOT NULL ORDER BY kocab ASC');

        res.json({ 
            status: 'success', 
            data: result.recordset
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Endpoint Tambah User
app.post('/users/add', async (req, res) => {
    try {
        const { username, password, role, cabang, kocab, pelaksana } = req.body;
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('u', sql.VarChar, username)
            .input('p', sql.VarChar, passwordHash)
            .input('r', sql.VarChar, role)
            .input('c', sql.VarChar, cabang)
            .input('k', sql.VarChar, kocab)
            // mssql akan menangani nilai null dari JS menjadi NULL di SQL
            .input('pl', sql.VarChar, pelaksana) 
            .query('INSERT INTO spkp_users (username, password, role, cabang, kocab, pelaksana) VALUES (@u, @p, @r, @c, @k, @pl)');

        res.json({ status: 'success', message: 'User berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Endpoint Edit User
app.put('/users/update', async (req, res) => {
    try {
        const { username, password, role, cabang, kocab, pelaksana } = req.body;
        let pool = await sql.connect(dbConfig);
        let request = pool.request();

        // Parameter dasar
        request.input('u', sql.VarChar, username);
        request.input('r', sql.VarChar, role);
        request.input('c', sql.VarChar, cabang);
        request.input('k', sql.VarChar, kocab);
        request.input('pl', sql.VarChar, pelaksana);

        let query = "";

        // JIKA password diisi (tidak kosong/null)
        if (password && password.trim() !== "") {
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            request.input('p', sql.VarChar, passwordHash);
            
            query = `
                UPDATE spkp_users 
                SET password = @p, role = @r, cabang = @c, kocab = @k, pelaksana = @pl 
                WHERE username = @u
            `;
        } else {
            // JIKA password kosong, jangan sentuh kolom password di DB
            query = `
                UPDATE spkp_users 
                SET role = @r, cabang = @c, kocab = @k, pelaksana = @pl 
                WHERE username = @u
            `;
        }

        await request.query(query);
        res.json({ status: 'success', message: 'User berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Endpoint Cari SPKP
app.get('/spkp/search', async (req, res) => {
    try {
        const { nomor } = req.query;
        if (!nomor) return res.status(400).json({ status: 'error', message: 'Nomor wajib diisi' });

        let pool = await sql.connect(dbConfig);
        let mssqlResult = await pool.request()
            .input('no', sql.VarChar, nomor)
            .query('SELECT * FROM spkp_test WHERE no_spkp = @no');

        if (mssqlResult.recordset.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
        }

        const dataSpkp = mssqlResult.recordset[0];

        // --- BAGIAN MYSQL ---
        // Pastikan variabel 'mysqlRows' didefinisikan di sini
        const [mysqlRows] = await mysqlPool.query(
            'SELECT tanggal_kontak, tanggal_selesai, status FROM tiket WHERE nomor_tiket = ?', 
            [nomor]
        );

        // Kirim ke Frontend
        res.json({
            status: 'success',
            data: dataSpkp,
            tiket: mysqlRows.length > 0 ? mysqlRows[0] : null // mysqlRows harus ada di dalam blok try ini
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API berjalan di http://localhost:${PORT}`);
});