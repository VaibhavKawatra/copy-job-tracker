const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET all jobs (no changes needed here)
router.get('/', auth, async (req, res) => {
  try {
    const allJobs = await pool.query(
      'SELECT * FROM job_applications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(allJobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new job (updated to include new fields)
router.post('/', auth, async (req, res) => {
  try {
    const { company_name, job_title, application_date, status, url, location, salary, notes } = req.body;
    const newJob = await pool.query(
      'INSERT INTO job_applications (user_id, company_name, job_title, application_date, status, url, location, salary, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [req.user.id, company_name, job_title, application_date, status, url, location, salary, notes]
    );
    res.status(201).json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT (update) a job (updated to include new fields)
router.put('/:id', auth, async (req, res) => {
  try {
    const { company_name, job_title, application_date, status, url, location, salary, notes } = req.body;
    const { id } = req.params;

    const updatedJob = await pool.query(
      'UPDATE job_applications SET company_name = $1, job_title = $2, application_date = $3, status = $4, url = $5, location = $6, salary = $7, notes = $8 WHERE id = $9 AND user_id = $10 RETURNING *',
      [company_name, job_title, application_date, status, url, location, salary, notes, id, req.user.id]
    );

    if (updatedJob.rows.length === 0) {
      return res.status(404).json({ msg: 'Job not found or user not authorized' });
    }

    res.json(updatedJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a job (no changes needed here)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query(
      'DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ msg: 'Job not found or user not authorized' });
    }

    res.json({ msg: 'Job application deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
