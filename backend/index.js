import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('patient', 'caretaker')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Medications table
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      instructions TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Medication logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      taken_at DATETIME NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medication_id) REFERENCES medications (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Patient-caretaker relationships
  db.run(`
    CREATE TABLE IF NOT EXISTS patient_caretaker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      caretaker_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users (id),
      FOREIGN KEY (caretaker_id) REFERENCES users (id),
      UNIQUE(patient_id, caretaker_id)
    )
  `);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['patient', 'caretaker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign(
          { id: this.lastID, email, role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, email, name, role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, name, role FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Medications CRUD
app.get('/api/medications', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, medications) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(medications);
    }
  );
});

app.post('/api/medications', authenticateToken, (req, res) => {
  const { name, dosage, frequency, instructions, start_date, end_date } = req.body;

  if (!name || !dosage || !frequency || !start_date) {
    return res.status(400).json({ error: 'Name, dosage, frequency, and start date are required' });
  }

  db.run(
    'INSERT INTO medications (user_id, name, dosage, frequency, instructions, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, dosage, frequency, instructions, start_date, end_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create medication' });
      }

      db.get(
        'SELECT * FROM medications WHERE id = ?',
        [this.lastID],
        (err, medication) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.status(201).json(medication);
        }
      );
    }
  );
});

app.put('/api/medications/:id', authenticateToken, (req, res) => {
  const { name, dosage, frequency, instructions, start_date, end_date } = req.body;
  const medicationId = req.params.id;

  db.run(
    'UPDATE medications SET name = ?, dosage = ?, frequency = ?, instructions = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
    [name, dosage, frequency, instructions, start_date, end_date, medicationId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update medication' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      db.get(
        'SELECT * FROM medications WHERE id = ?',
        [medicationId],
        (err, medication) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.json(medication);
        }
      );
    }
  );
});

app.delete('/api/medications/:id', authenticateToken, (req, res) => {
  const medicationId = req.params.id;

  db.run(
    'DELETE FROM medications WHERE id = ? AND user_id = ?',
    [medicationId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete medication' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.json({ message: 'Medication deleted successfully' });
    }
  );
});

// Medication logs
app.get('/api/medication-logs', authenticateToken, (req, res) => {
  const { date, medication_id } = req.query;

  let query = `
    SELECT ml.*, m.name as medication_name, m.dosage, m.frequency
    FROM medication_logs ml
    JOIN medications m ON ml.medication_id = m.id
    WHERE ml.user_id = ?
  `;
  const params = [req.user.id];

  if (date) {
    query += ' AND DATE(ml.taken_at) = ?';
    params.push(date);
  }

  if (medication_id) {
    query += ' AND ml.medication_id = ?';
    params.push(medication_id);
  }

  query += ' ORDER BY ml.taken_at DESC';

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(logs);
  });
});

app.post('/api/medication-logs', authenticateToken, (req, res) => {
  const { medication_id, taken_at, status, notes } = req.body;

  if (!medication_id || !taken_at || !status) {
    return res.status(400).json({ error: 'Medication ID, taken_at, and status are required' });
  }

  db.run(
    'INSERT INTO medication_logs (medication_id, user_id, taken_at, status, notes) VALUES (?, ?, ?, ?, ?)',
    [medication_id, req.user.id, taken_at, status, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to log medication' });
      }

      db.get(
        `SELECT ml.*, m.name as medication_name, m.dosage, m.frequency
         FROM medication_logs ml
         JOIN medications m ON ml.medication_id = m.id
         WHERE ml.id = ?`,
        [this.lastID],
        (err, log) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.status(201).json(log);
        }
      );
    }
  );
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const queries = [
    // Total medications
    new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM medications WHERE user_id = ?',
        [req.user.id],
        (err, result) => {
          if (err) reject(err);
          else resolve({ totalMedications: result.total });
        }
      );
    }),

    // Today's adherence
    new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          COUNT(*) as total_due,
          SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken
         FROM medication_logs ml
         WHERE ml.user_id = ? AND DATE(ml.taken_at) = DATE('now')`,
        [req.user.id],
        (err, result) => {
          if (err) reject(err);
          else {
            const row = result[0] || { total_due: 0, taken: 0 };
            const adherenceRate = row.total_due > 0 ? (row.taken / row.total_due) * 100 : 0;
            resolve({ todayAdherence: Math.round(adherenceRate) });
          }
        }
      );
    }),

    // Current streak
    new Promise((resolve, reject) => {
      db.all(
        `SELECT DATE(taken_at) as date, 
          COUNT(*) as total_due,
          SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken
         FROM medication_logs
         WHERE user_id = ? AND DATE(taken_at) >= DATE('now', '-30 days')
         GROUP BY DATE(taken_at)
         ORDER BY DATE(taken_at) DESC`,
        [req.user.id],
        (err, results) => {
          if (err) reject(err);
          else {
            let streak = 0;
            for (const row of results) {
              if (row.taken === row.total_due && row.total_due > 0) {
                streak++;
              } else {
                break;
              }
            }
            resolve({ currentStreak: streak });
          }
        }
      );
    })
  ];

  Promise.all(queries)
    .then(results => {
      const stats = Object.assign({}, ...results);
      res.json(stats);
    })
    .catch(err => {
      console.error('Dashboard stats error:', err);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    });
});

// Weekly adherence data
app.get('/api/dashboard/weekly-adherence', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
      DATE(taken_at) as date,
      COUNT(*) as total_due,
      SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken
     FROM medication_logs
     WHERE user_id = ? AND DATE(taken_at) >= DATE('now', '-7 days')
     GROUP BY DATE(taken_at)
     ORDER BY DATE(taken_at)`,
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }

      const weeklyData = results.map(row => ({
        date: row.date,
        adherence: row.total_due > 0 ? Math.round((row.taken / row.total_due) * 100) : 0
      }));

      res.json(weeklyData);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});