const Calculator = require('../models/calculator');
const pool = require('../db/database');

// POST method for calculating points and saving results
exports.calculatePointsAndSaveResult = async (req, res) => {
  const { athleteId, event, bestResult, ageGroup } = req.body;

  if (!athleteId || !event || bestResult === undefined || !ageGroup) {
    return res.status(400).send('Sisesta sportlase id, ala, tulemus ja vanuse grupp');
  }

  try {
    const athleteQuery = 'SELECT gender FROM athletes WHERE id = $1';
    const athleteQueryValues = [athleteId];
    const athleteResult = await pool.query(athleteQuery, athleteQueryValues);
    const gender = athleteResult.rows[0].gender;

    if (!gender) {
      return res.status(404).send('Athlete not found');
    }

    const calculator = new Calculator(event, bestResult, ageGroup);
    const points = calculator.calculatePoints(gender);

    const query = 'INSERT INTO results (athlete_id, event, age_group, best_result, points) VALUES ($1, $2, $3, $4, $5) RETURNING points';
    const values = [athleteId, event, ageGroup, bestResult, points];
    const result = await pool.query(query, values);

    res.json({ points: result.rows[0].points });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Display results
exports.getResults = async (_req, res) => {
  try {
    const query = `
      SELECT 
          results.id AS result_id, 
          athletes.id AS athlete_id, 
          athletes.first_name, 
          athletes.last_name, 
          athletes.gender, 
          results.event, 
          results.age_group, 
          results.best_result, 
          results.points
      FROM 
          results
      INNER JOIN 
          athletes ON results.athlete_id = athletes.id;
    `;
    
    const results = await pool.query(query);

    res.json(results.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
