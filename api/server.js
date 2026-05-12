const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//Konfigurasi Multer dengan Sub-Folder Otomatis
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subFolder = '';
        if (file.fieldname === 'fot_sebelum') subFolder = 'foto_sebelum';
        else if (file.fieldname === 'fot_proses') subFolder = 'foto_proses';
        else if (file.fieldname === 'fot_sesudah') subFolder = 'foto_sesudah';

        const fullPath = path.join('uploads', subFolder);

        // Buat folder secara otomatis (recursive: true agar folder uploads juga dibuat jika belum ada)
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Konfigurasi Database
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Set true jika pakai Azure
        trustServerCertificate: true,
        useUTC: false
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

//Endpoint untuk menerima laporan dan foto
app.post('/api/spkp-report', upload.fields([
    
    { name: 'fot_sebelum', maxCount: 1 },
    { name: 'fot_proses', maxCount: 1 },
    { name: 'fot_sesudah', maxCount: 1 }
]), async (req, res) => {
    console.log("--- ADA REQUEST MASUK ---"); // Tambahkan ini
    console.log("Body:", req.body);            // Tambahkan ini
    try {
        const { no_spkp } = req.body;
        const files = req.files;

        if (!no_spkp) return res.status(400).json({ status: 'error', message: 'No SPKP tidak ditemukan' });

        // Simpan PATH LENGKAP ke database agar mudah dipanggil
        const fot_sebelum = files['fot_sebelum'] ? `foto_sebelum/${files['fot_sebelum'][0].filename}` : null;
        const fot_proses = files['fot_proses'] ? `foto_proses/${files['fot_proses'][0].filename}` : null;
        const fot_sesudah = files['fot_sesudah'] ? `foto_sesudah/${files['fot_sesudah'][0].filename}` : null;

        // Eksekusi SQL Update
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('no', sql.VarChar, no_spkp)
            .input('f1', sql.VarChar, fot_sebelum)
            .input('f2', sql.VarChar, fot_proses)
            .input('f3', sql.VarChar, fot_sesudah)
            .query(`
                UPDATE spkp_test 
                SET fot_sebelum = @f1, 
                    fot_proses = @f2, 
                    fot_sesudah = @f3,
                    isFinish = 1
                WHERE no_spkp = @no
            `);

        console.log(`✅ Laporan diterima untuk SPKP: ${no_spkp}`);
        res.json({ status: 'success', message: 'Laporan dan foto berhasil disimpan' });
    } catch (err) {
        console.error("❌ Error Laporan:", err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
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

app.post('/spkp/sync', async (req, res) => {
    try {
        const { nomor } = req.body;
        if (!nomor) return res.status(400).json({ status: 'error', message: 'Nomor SPKP diperlukan' });

        // 1. Ambil data terbaru dari MySQL
        const [mysqlRows] = await mysqlPool.query(
            'SELECT tanggal_selesai, status FROM tiket WHERE nomor_tiket = ?', 
            [nomor]
        );

        if (mysqlRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tiket tidak ditemukan di MySQL' });
        }

        const tiket = mysqlRows[0];

        if (tiket.status === '2' && tiket.tanggal_selesai) {
            // AMBIL TANGGAL ASLI TANPA KONVERSI UTC
            const d = new Date(tiket.tanggal_selesai);
            
            // Format manual ke YYYY-MM-DD HH:mm:ss
            const pad = (n) => n.toString().padStart(2, '0');
            const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

            console.log("Tanggal Asli MySQL:", tiket.tanggal_selesai);
            console.log("Tanggal Kirim ke MS SQL:", formattedDate); // Pastikan di log ini jamnya sudah benar

            let pool = await sql.connect(dbConfig);
            
            await pool.request()
                .input('no', sql.VarChar, nomor)
                .input('tgl', sql.VarChar, formattedDate) // Kirim string murni
                .query(`
                    UPDATE spkp_test 
                    SET selesai = CAST(@tgl AS DATETIME), status = 'SELESAI' 
                    WHERE no_spkp = @no
                `);

            res.json({ 
                status: 'success', 
                message: 'Data berhasil disinkronkan',
                syncedData: { selesai: formattedDate, status: 'SELESAI' }
            });
        } else {
            res.status(400).json({ 
                status: 'error', 
                message: 'Kondisi sinkron tidak terpenuhi (Tiket belum Selesai/Status bukan 2)' 
            });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/spkp-proses', async (req, res) => {
    try {
        const { kocab, pelaksana, role } = req.query;

        // TAMBAHKAN LOG INI
    console.log("--- DEBUG SPKP PROSES ---");
    console.log("KOCAB diterima:", kocab);
    console.log("PELAKSANA diterima:", pelaksana);
    console.log("ROLE yang diminta: REKANAN");

        // Validasi input
        if (!kocab || !pelaksana) {
            return res.status(400).json({ status: 'error', message: 'Parameter kocab dan pelaksana diperlukan' });
        }

        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('kocab', sql.VarChar, kocab)
            .input('pelaksana', sql.VarChar, pelaksana)
            .input('role', sql.VarChar, 'REKANAN') // Tambahkan input role
            .query(`
                SELECT * FROM spkp_test 
                WHERE status = 'PROSES' 
                AND isMobile = 1
                AND isFinish is null
                AND kocab = @kocab 
                AND perusahaan_rekanan = @pelaksana
                ORDER BY tgl_spkp DESC
            `);

        res.json({ 
            status: 'success', 
            count: result.recordset.length,
            data: result.recordset 
        });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/spkp-selesai', async (req, res) => {
    try {
        const { kocab, pelaksana } = req.query;
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('kocab', sql.VarChar, kocab)
            .input('pelaksana', sql.VarChar, pelaksana)
            .query(`
                SELECT * FROM spkp_test 
                WHERE status = 'PROSES' 
                AND isMobile = 1
                AND isFinish = 1
                AND kocab = @kocab 
                AND perusahaan_rekanan = @pelaksana
                ORDER BY tgl_spkp DESC
            `);
        // TAMBAHKAN INI UNTUK DEBUG
        console.log("Contoh Data Pertama:", result.recordset[0]);

        res.json({ status: 'success', data: result.recordset });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/rekanan/:kocab', async (req, res) => {
    try {
        const { kocab } = req.params;
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('kocab', sql.VarChar, kocab)
            .query("SELECT DISTINCT pelaksana FROM vRekananMobile WHERE kocab = @kocab ORDER BY pelaksana ASC");
        
        res.json({ status: 'success', data: result.recordset });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API berjalan di http://localhost:${PORT}`);
});