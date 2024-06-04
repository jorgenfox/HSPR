const pool = require('../db/database');

// Function to check if an athlete exists
exports.checkAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.query;

    try {
        const query = 'SELECT id FROM athletes WHERE first_name = $1 AND last_name = $2 AND gender = $3';
        const values = [firstName, lastName, gender];
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            res.json({ exists: true, athleteId: result.rows[0].id });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to create a new athlete
exports.createAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.body;

    if (!firstName || !lastName || !gender) {
        return res.status(400).send('Sisesta eesnimi, perenimi ja sugu');
    }

    try {
        const query = 'INSERT INTO athletes (first_name, last_name, gender) VALUES ($1, $2, $3) RETURNING id';
        const values = [firstName, lastName, gender];
        const result = await pool.query(query, values);

        res.json({ athleteId: result.rows[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getFirstNames = async (req, res) => {
  const { prefix } = req.query;

  try {
      const query = 'SELECT first_name, last_name, gender FROM athletes WHERE first_name ILIKE $1 LIMIT 10';
      const values = [`${prefix}%`];
      const result = await pool.query(query, values);

      res.json(result.rows);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
};

exports.getLastNames = async (req, res) => {
  const { prefix } = req.query;

  try {
      const query = 'SELECT first_name, last_name, gender FROM athletes WHERE last_name ILIKE $1 LIMIT 10';
      const values = [`${prefix}%`];
      const result = await pool.query(query, values);

      res.json(result.rows);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
};