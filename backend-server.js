/**
 * Station Master Online V2 - Backend API
 * Express.js + PostgreSQL + JWT Authentication
 * 
 * API Endpoints:
 * - POST   /api/auth/register
 * - POST   /api/auth/login
 * - GET    /api/qsos (avec filtres)
 * - POST   /api/qsos (créer)
 * - PUT    /api/qsos/:id
 * - DELETE /api/qsos/:id
 * - POST   /api/qsos/import (ADIF)
 * - GET    /api/stats
 * - GET    /api/stats/heatmap
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ========== CONFIG ==========
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'station_master'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb' }));

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Pas de token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// ========== AUTH ROUTES ==========

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, callsign } = req.body;

  if (!email || !password || !callsign) {
    return res.status(400).json({ error: 'Champs requis: email, password, callsign' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password, callsign, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, callsign',
      [email, hashedPassword, callsign.toUpperCase()]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, callsign: user.callsign }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, callsign: user.callsign }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user: { id: user.id, email: user.email, callsign: user.callsign }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== QSO ROUTES ==========

// GET /api/qsos (avec filtres)
app.get('/api/qsos', authenticateToken, async (req, res) => {
  const { band, mode, call, startDate, endDate, limit = 100, offset = 0 } = req.query;

  try {
    let query = 'SELECT * FROM qsos WHERE user_id = $1';
    const params = [req.user.id];
    let paramCount = 2;

    if (band) {
      query += ` AND band = $${paramCount}`;
      params.push(band);
      paramCount++;
    }
    if (mode) {
      query += ` AND mode = $${paramCount}`;
      params.push(mode);
      paramCount++;
    }
    if (call) {
      query += ` AND call ILIKE $${paramCount}`;
      params.push(`%${call}%`);
      paramCount++;
    }
    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY date DESC, time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const totalResult = await pool.query('SELECT COUNT(*) FROM qsos WHERE user_id = $1', [req.user.id]);

    res.json({
      qsos: result.rows,
      total: parseInt(totalResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/qsos
app.post('/api/qsos', authenticateToken, async (req, res) => {
  const { date, time, call, band, mode, rstRx, rstTx, grid, notes, frequency, power } = req.body;

  if (!date || !time || !call || !band || !mode) {
    return res.status(400).json({ error: 'Champs requis: date, time, call, band, mode' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO qsos (user_id, date, time, call, band, mode, rst_rx, rst_tx, grid, notes, frequency, power, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [req.user.id, date, time, call.toUpperCase(), band, mode, rstRx || null, rstTx || null, grid || null, notes || null, frequency || null, power || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/qsos/:id
app.put('/api/qsos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date, time, call, band, mode, rstRx, rstTx, grid, notes, frequency, power } = req.body;

  try {
    // Vérifier que le QSO appartient à l'utilisateur
    const qsoResult = await pool.query('SELECT * FROM qsos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (qsoResult.rows.length === 0) {
      return res.status(404).json({ error: 'QSO non trouvé' });
    }

    const result = await pool.query(
      `UPDATE qsos SET date = COALESCE($2, date), time = COALESCE($3, time), call = COALESCE($4, call),
       band = COALESCE($5, band), mode = COALESCE($6, mode), rst_rx = COALESCE($7, rst_rx),
       rst_tx = COALESCE($8, rst_tx), grid = COALESCE($9, grid), notes = COALESCE($10, notes),
       frequency = COALESCE($11, frequency), power = COALESCE($12, power), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, date, time, call ? call.toUpperCase() : null, band, mode, rstRx, rstTx, grid, notes, frequency, power]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/qsos/:id
app.delete('/api/qsos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const qsoResult = await pool.query('SELECT * FROM qsos WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (qsoResult.rows.length === 0) {
      return res.status(404).json({ error: 'QSO non trouvé' });
    }

    await pool.query('DELETE FROM qsos WHERE id = $1', [id]);
    res.json({ message: 'QSO supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== IMPORT ADIF ==========

// POST /api/qsos/import
app.post('/api/qsos/import', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fichier requis' });
  }

  try {
    const adifContent = req.file.buffer.toString('utf-8');
    const qsos = parseADIF(adifContent);

    let importedCount = 0;
    for (const qso of qsos) {
      try {
        await pool.query(
          `INSERT INTO qsos (user_id, date, time, call, band, mode, rst_rx, rst_tx, grid, notes, frequency, power, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [req.user.id, qso.date, qso.time, qso.call, qso.band, qso.mode, qso.rstRx, qso.rstTx, qso.grid, qso.notes, qso.frequency, qso.power]
        );
        importedCount++;
      } catch (e) {
        console.warn(`Erreur import QSO ${qso.call}:`, e.message);
      }
    }

    res.json({ imported: importedCount, total: qsos.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du parsing ADIF' });
  }
});

// ========== STATISTICS ==========

// GET /api/stats
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM qsos WHERE user_id = $1', [req.user.id]);
    const bandsResult = await pool.query('SELECT band, COUNT(*) as count FROM qsos WHERE user_id = $1 GROUP BY band ORDER BY count DESC', [req.user.id]);
    const modesResult = await pool.query('SELECT mode, COUNT(*) as count FROM qsos WHERE user_id = $1 GROUP BY mode ORDER BY count DESC', [req.user.id]);
    const countriesResult = await pool.query('SELECT COUNT(DISTINCT call) as unique_calls FROM qsos WHERE user_id = $1', [req.user.id]);

    const lastQsoResult = await pool.query('SELECT date FROM qsos WHERE user_id = $1 ORDER BY date DESC LIMIT 1', [req.user.id]);

    const stats = {
      totalQsos: parseInt(totalResult.rows[0].count),
      uniqueCalls: parseInt(countriesResult.rows[0].unique_calls),
      lastQsoDate: lastQsoResult.rows.length > 0 ? lastQsoResult.rows[0].date : null,
      bandDistribution: bandsResult.rows,
      modeDistribution: modesResult.rows
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/stats/daily (pour graphiques)
app.get('/api/stats/daily', authenticateToken, async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const result = await pool.query(
      `SELECT date, COUNT(*) as count FROM qsos WHERE user_id = $1 AND date >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY date ORDER BY date DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== HELPERS ==========

function parseADIF(content) {
  const qsos = [];
  // Regex simple pour parser les QSO ADIF
  const qsoMatches = content.split('<EOR>');

  for (const qsoBlock of qsoMatches) {
    if (!qsoBlock.trim()) continue;

    const qso = {};

    // Extraire chaque champ (ex: <CALL:4>ON5AM)
    const fieldRegex = /<(\w+):(\d+)>([^<]*)/g;
    let match;

    while ((match = fieldRegex.exec(qsoBlock)) !== null) {
      const [, fieldName, length, value] = match;
      qso[fieldName.toLowerCase()] = value;
    }

    if (qso.qso_date && qso.time_on && qso.call) {
      qsos.push({
        date: qso.qso_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
        time: qso.time_on.replace(/(\d{2})(\d{2})/, '$1:$2'),
        call: qso.call,
        band: qso.band || null,
        mode: qso.mode || null,
        rstRx: qso.rst_rcvd || null,
        rstTx: qso.rst_sent || null,
        grid: qso.gridsquare || null,
        notes: qso.notes || null,
        frequency: qso.freq || null,
        power: qso.tx_pwr || null
      });
    }
  }

  return qsos;
}

// ========== INIT & START ==========

// Créer tables si elles existent pas
const initDB = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      callsign VARCHAR(20) NOT NULL,
      grid_square VARCHAR(10),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS qsos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      time TIME NOT NULL,
      call VARCHAR(20) NOT NULL,
      band VARCHAR(10) NOT NULL,
      mode VARCHAR(20) NOT NULL,
      rst_rx VARCHAR(5),
      rst_tx VARCHAR(5),
      grid VARCHAR(10),
      frequency DECIMAL(10, 3),
      power INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_qsos_user_id ON qsos(user_id);
    CREATE INDEX IF NOT EXISTS idx_qsos_date ON qsos(date);
    CREATE INDEX IF NOT EXISTS idx_qsos_band ON qsos(band);
    CREATE INDEX IF NOT EXISTS idx_qsos_call ON qsos(call);
  `;

  try {
    await pool.query(schema);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database init error:', err);
  }
};

const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

start();

module.exports = app;
