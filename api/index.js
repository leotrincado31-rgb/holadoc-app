const express = require('express');
const cors = require('cors');
const { db } = require('@vercel/postgres');
require('dotenv').config(); // Load .env for local development
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper to convert sqlite `?` to postgres `$1, $2`
function buildQuery(queryStr, params = []) {
  let text = queryStr;
  let values = params;
  let count = 1;
  while (text.includes('?')) {
    text = text.replace('?', `$${count}`);
    count++;
  }
  return { text, values };
}

// Helper for promise-based db runs and queries
async function dbRun(queryStr, params = []) {
  const { text, values } = buildQuery(queryStr, params);
  const client = await db.connect();
  try {
    return await client.query(text, values);
  } finally {
    client.release();
  }
}

async function dbAll(queryStr, params = []) {
  const { text, values } = buildQuery(queryStr, params);
  const client = await db.connect();
  try {
    const result = await client.query(text, values);
    return result.rows;
  } finally {
    client.release();
  }
}

async function dbGet(queryStr, params = []) {
  const { text, values } = buildQuery(queryStr, params);
  const client = await db.connect();
  try {
    const result = await client.query(text, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Create database schema
async function initDb() {
  await dbRun(`CREATE TABLE IF NOT EXISTS patients (
    dni VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(255),
    birthDate VARCHAR(255),
    obraSocial VARCHAR(255),
    nroAfiliado VARCHAR(255),
    type VARCHAR(50) DEFAULT 'patient',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS doctors (
    dni VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    matricula VARCHAR(255),
    specialty VARCHAR(255),
    phone VARCHAR(255),
    consultationDuration VARCHAR(255),
    schedule TEXT,
    type VARCHAR(50) DEFAULT 'doctor',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(255) PRIMARY KEY,
    patientDni VARCHAR(255),
    doctorDni VARCHAR(255),
    date VARCHAR(255),
    time VARCHAR(255),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pendiente',
    type VARCHAR(50),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(255) PRIMARY KEY,
    patientDni VARCHAR(255),
    doctorDni VARCHAR(255),
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pendiente',
    details TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    patientDni TEXT,
    doctorDni TEXT,
    date TEXT,
    reason TEXT,
    pathologicalHistory TEXT,
    surgicalHistory TEXT,
    currentMedication TEXT,
    nextObjectives TEXT,
    notes TEXT,
    createdAt TEXT
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS health (
    id TEXT PRIMARY KEY,
    patientDni TEXT,
    date TEXT,
    bloodPressureSys INTEGER,
    bloodPressureDia INTEGER,
    weight REAL,
    glucose INTEGER,
    temperature REAL,
    heartRate INTEGER,
    notes TEXT,
    createdAt TEXT
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userDni TEXT,
    userType TEXT,
    type TEXT,
    title TEXT,
    message TEXT,
    relatedId TEXT,
    read INTEGER DEFAULT 0,
    createdAt TEXT
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS blocked_dates (
    doctorDni TEXT,
    date TEXT,
    PRIMARY KEY (doctorDni, date)
  )`);

  // Seed demo data if empty
  const patientCount = await dbGet(`SELECT COUNT(*) as count FROM patients`);
  if (patientCount.count === 0) {
    console.log('Sembrando datos iniciales en la base de datos...');
    
    // Doctor demo
    const docSchedule = JSON.stringify({
      lunes: { active: true, start: '08:00', end: '16:00' },
      martes: { active: true, start: '08:00', end: '16:00' },
      miercoles: { active: true, start: '08:00', end: '16:00' },
      jueves: { active: true, start: '08:00', end: '16:00' },
      viernes: { active: true, start: '08:00', end: '16:00' },
      sabado: { active: false, start: '09:00', end: '12:00' },
      domingo: { active: false, start: '09:00', end: '12:00' }
    });

    await dbRun(
      `INSERT INTO doctors (dni, name, matricula, specialty, phone, consultationDuration, schedule, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['99999999', 'Dra. María González', 'MN45678', 'Clínica Médica', '1155551234', '30', docSchedule, 'doctor', new Date().toISOString()]
    );

    // Patient demo
    await dbRun(
      `INSERT INTO patients (dni, name, phone, birthDate, obraSocial, nroAfiliado, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['11111111', 'Juan Carlos Pérez', '1144445678', '1948-05-12', 'OSDE', '1234567890', 'patient', new Date().toISOString()]
    );

    // Notification demo
    await dbRun(
      `INSERT INTO notifications (id, userDni, userType, type, title, message, relatedId, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['not_' + Date.now() + '_1', '11111111', 'patient', 'info', '¡Bienvenido/a a Tu Doctor de Cabecera!', 'Tu perfil fue creado correctamente en la base de datos.', '', 0, new Date().toISOString()]
    );

    // Health data demo
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      await dbRun(
        `INSERT INTO health (id, patientDni, date, bloodPressureSys, bloodPressureDia, weight, glucose, temperature, heartRate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'hd_' + Date.now() + '_' + i,
          '11111111',
          d.toISOString().split('T')[0],
          120 + Math.floor(Math.random() * 15),
          75 + Math.floor(Math.random() * 10),
          78.5 + (Math.random() * 1.5 - 0.75),
          90 + Math.floor(Math.random() * 25),
          36.2 + (Math.random() * 0.8),
          68 + Math.floor(Math.random() * 12),
          i === 0 ? 'Me sentí bien hoy.' : '',
          new Date().toISOString()
        ]
      );
    }

    // Record demo
    await dbRun(
      `INSERT INTO records (id, patientDni, doctorDni, date, reason, pathologicalHistory, surgicalHistory, currentMedication, nextObjectives, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'rec_' + Date.now() + '_1',
        '11111111',
        '99999999',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'Control anual y ajuste de medicación para la presión.',
        'Hipertensión arterial diagnosticada en 2015. Artrosis leve.',
        'Apendicectomía a los 15 años.',
        'Enalapril 10mg diario por la mañana.',
        'Mantener presión bajo 135/85. Caminar 30 minutos diarios.',
        'Paciente se encuentra estable. Se sugiere continuar con dieta hiposódica.',
        new Date().toISOString()
      ]
    );

    // Request demo
    await dbRun(
      `INSERT INTO requests (id, patientDni, doctorDni, type, status, details, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'req_' + Date.now() + '_1',
        '11111111',
        '99999999',
        'receta',
        'pendiente',
        JSON.stringify({ medications: 'Enalapril 10mg - 1 caja de 30 comprimidos' }),
        new Date().toISOString()
      ]
    );
  }
}

// === REST API ENDPOINTS ===

// --- Patients ---
app.get('/api/patients', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM patients`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients/:dni', async (req, res) => {
  try {
    const row = await dbGet(`SELECT * FROM patients WHERE dni = ?`, [req.params.dni]);
    if (!row) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const data = req.body;
    const existing = await dbGet(`SELECT dni FROM patients WHERE dni = ?`, [data.dni]);
    if (existing) return res.status(400).json({ error: 'El DNI ya se encuentra registrado' });

    data.createdAt = new Date().toISOString();
    await dbRun(
      `INSERT INTO patients (dni, name, phone, birthDate, obraSocial, nroAfiliado, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.dni, data.name, data.phone, data.birthDate, data.obraSocial || '', data.nroAfiliado || '', 'patient', data.createdAt]
    );
    res.status(201).json({ success: true, patient: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/patients/:dni', async (req, res) => {
  try {
    const updates = req.body;
    const current = await dbGet(`SELECT * FROM patients WHERE dni = ?`, [req.params.dni]);
    if (!current) return res.status(404).json({ error: 'Paciente no encontrado' });

    const updated = { ...current, ...updates };
    await dbRun(
      `UPDATE patients SET name = ?, phone = ?, birthDate = ?, obraSocial = ?, nroAfiliado = ? WHERE dni = ?`,
      [updated.name, updated.phone, updated.birthDate, updated.obraSocial, updated.nroAfiliado, req.params.dni]
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Doctors ---
app.get('/api/doctors', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM doctors`);
    const parsed = rows.map(d => ({
      ...d,
      schedule: d.schedule ? JSON.parse(d.schedule) : {}
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctors/:dni', async (req, res) => {
  try {
    const row = await dbGet(`SELECT * FROM doctors WHERE dni = ?`, [req.params.dni]);
    if (!row) return res.status(404).json({ error: 'Médico no encontrado' });
    row.schedule = row.schedule ? JSON.parse(row.schedule) : {};
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const data = req.body;
    const existing = await dbGet(`SELECT dni FROM doctors WHERE dni = ?`, [data.dni]);
    if (existing) return res.status(400).json({ error: 'El DNI ya se encuentra registrado' });

    data.createdAt = new Date().toISOString();
    const scheduleStr = typeof data.schedule === 'object' ? JSON.stringify(data.schedule) : (data.schedule || '{}');

    await dbRun(
      `INSERT INTO doctors (dni, name, matricula, specialty, phone, consultationDuration, schedule, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.dni, data.name, data.matricula, data.specialty, data.phone, data.consultationDuration || '30', scheduleStr, 'doctor', data.createdAt]
    );
    res.status(201).json({ success: true, doctor: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/doctors/:dni', async (req, res) => {
  try {
    const updates = req.body;
    const current = await dbGet(`SELECT * FROM doctors WHERE dni = ?`, [req.params.dni]);
    if (!current) return res.status(404).json({ error: 'Médico no encontrado' });

    const currentSchedule = current.schedule ? JSON.parse(current.schedule) : {};
    const updatedSchedule = updates.schedule ? JSON.stringify(updates.schedule) : JSON.stringify(currentSchedule);

    const updated = {
      name: updates.name || current.name,
      matricula: updates.matricula || current.matricula,
      specialty: updates.specialty || current.specialty,
      phone: updates.phone || current.phone,
      consultationDuration: updates.consultationDuration || current.consultationDuration,
      schedule: updatedSchedule
    };

    await dbRun(
      `UPDATE doctors SET name = ?, matricula = ?, specialty = ?, phone = ?, consultationDuration = ?, schedule = ? WHERE dni = ?`,
      [updated.name, updated.matricula, updated.specialty, updated.phone, updated.consultationDuration, updated.schedule, req.params.dni]
    );

    res.json({ ...current, ...updates, schedule: JSON.parse(updated.schedule) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Appointments ---
app.get('/api/appointments', async (req, res) => {
  try {
    let sql = `SELECT * FROM appointments WHERE 1=1`;
    const params = [];
    if (req.query.patientDni) { sql += ` AND patientDni = ?`; params.push(req.query.patientDni); }
    if (req.query.doctorDni) { sql += ` AND doctorDni = ?`; params.push(req.query.doctorDni); }
    if (req.query.date) { sql += ` AND date = ?`; params.push(req.query.date); }
    if (req.query.status) { sql += ` AND status = ?`; params.push(req.query.status); }

    const rows = await dbAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'apt_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    data.status = data.status || 'pendiente';
    data.createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO appointments (id, patientDni, doctorDni, date, time, reason, status, type, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.patientDni, data.doctorDni, data.date, data.time, data.reason || '', data.status, data.type || '', data.notes || '', data.createdAt]
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const current = await dbGet(`SELECT * FROM appointments WHERE id = ?`, [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Cita no encontrada' });

    const updated = { ...current, ...req.body };
    await dbRun(
      `UPDATE appointments SET status = ?, notes = ?, date = ?, time = ? WHERE id = ?`,
      [updated.status, updated.notes, updated.date, updated.time, req.params.id]
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Requests ---
app.get('/api/requests', async (req, res) => {
  try {
    let sql = `SELECT * FROM requests WHERE 1=1`;
    const params = [];
    if (req.query.patientDni) { sql += ` AND patientDni = ?`; params.push(req.query.patientDni); }
    if (req.query.doctorDni) { sql += ` AND doctorDni = ?`; params.push(req.query.doctorDni); }
    if (req.query.status) { sql += ` AND status = ?`; params.push(req.query.status); }
    if (req.query.type) { sql += ` AND type = ?`; params.push(req.query.type); }
    sql += ` ORDER BY createdAt DESC`;

    const rows = await dbAll(sql, params);
    const parsed = rows.map(r => ({
      ...r,
      details: r.details ? JSON.parse(r.details) : {}
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'req_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    data.status = data.status || 'pendiente';
    data.createdAt = new Date().toISOString();
    const detailsStr = typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || '{}');

    await dbRun(
      `INSERT INTO requests (id, patientDni, doctorDni, type, status, details, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.patientDni, data.doctorDni, data.type, data.status, detailsStr, data.createdAt]
    );
    res.status(201).json({ ...data, details: JSON.parse(detailsStr) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const current = await dbGet(`SELECT * FROM requests WHERE id = ?`, [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const updates = req.body;
    const currentDetails = current.details ? JSON.parse(current.details) : {};
    const updatedDetails = updates.details ? JSON.stringify({ ...currentDetails, ...updates.details }) : current.details;
    const updatedStatus = updates.status || current.status;

    await dbRun(
      `UPDATE requests SET status = ?, details = ? WHERE id = ?`,
      [updatedStatus, updatedDetails, req.params.id]
    );

    const updatedRow = await dbGet(`SELECT * FROM requests WHERE id = ?`, [req.params.id]);
    updatedRow.details = updatedRow.details ? JSON.parse(updatedRow.details) : {};
    res.json(updatedRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Records ---
app.get('/api/records/:patientDni', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM records WHERE patientDni = ? ORDER BY date DESC`, [req.params.patientDni]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'rec_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    data.createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO records (id, patientDni, doctorDni, date, reason, pathologicalHistory, surgicalHistory, currentMedication, nextObjectives, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.patientDni, data.doctorDni, data.date, data.reason || '', data.pathologicalHistory || '', data.surgicalHistory || '', data.currentMedication || '', data.nextObjectives || '', data.notes || '', data.createdAt]
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Data ---
app.get('/api/health/:patientDni', async (req, res) => {
  try {
    const limit = parseInt(req.query.days) || 30;
    const rows = await dbAll(`SELECT * FROM health WHERE patientDni = ? ORDER BY date DESC LIMIT ?`, [req.params.patientDni, limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/health', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'hd_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    data.createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO health (id, patientDni, date, bloodPressureSys, bloodPressureDia, weight, glucose, temperature, heartRate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.patientDni, data.date, data.bloodPressureSys, data.bloodPressureDia, data.weight, data.glucose, data.temperature, data.heartRate, data.notes || '', data.createdAt]
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Notifications ---
app.get('/api/notifications', async (req, res) => {
  try {
    const { userDni, userType } = req.query;
    const rows = await dbAll(`SELECT * FROM notifications WHERE userDni = ? AND userType = ? ORDER BY createdAt DESC`, [userDni, userType]);
    const formatted = rows.map(r => ({ ...r, read: Boolean(r.read) }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const data = req.body;
    data.id = 'not_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    data.read = 0;
    data.createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO notifications (id, userDni, userType, type, title, message, relatedId, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.userDni, data.userType, data.type, data.title, data.message, data.relatedId || '', 0, data.createdAt]
    );
    res.status(201).json({ ...data, read: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await dbRun(`UPDATE notifications SET read = 1 WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { userDni, userType } = req.body;
    await dbRun(`UPDATE notifications SET read = 1 WHERE userDni = ? AND userType = ?`, [userDni, userType]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Blocked Dates ---
app.get('/api/blocked-dates/:doctorDni', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT date FROM blocked_dates WHERE doctorDni = ?`, [req.params.doctorDni]);
    res.json(rows.map(r => r.date));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/blocked-dates', async (req, res) => {
  try {
    const { doctorDni, date } = req.body;
    await dbRun(`INSERT OR IGNORE INTO blocked_dates (doctorDni, date) VALUES (?, ?)`, [doctorDni, date]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/blocked-dates', async (req, res) => {
  try {
    const { doctorDni, date } = req.body;
    await dbRun(`DELETE FROM blocked_dates WHERE doctorDni = ? AND date = ?`, [doctorDni, date]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export app for Vercel Serverless Functions
module.exports = app;

// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Servidor Tu Doctor de Cabecera corriendo en http://localhost:${PORT}`);
      console.log(` Base de datos relacional SQLite inicializada.`);
      console.log(`=================================================`);
    });
  }).catch(err => {
    console.error('Error al inicializar la base de datos:', err);
  });
} else {
  initDb().catch(err => console.error('Error initDb en Vercel:', err));
}
