const Calculator = require('../models/calculator');
const pool = require('../db/database');
const Athlete = require('../models/athlete');

exports.calculatePointsAndSaveResult = async (req, res) => {
    const { athleteId, event, bestResult, ageGroup } = req.body;

    if (!athleteId || !event || bestResult === undefined || !ageGroup) {
        return res.status(400).send('Sisesta sportlase id, ala, tulemus ja vanuse grupp');
    }

    try {
        const athleteQuery = 'SELECT sugu FROM sportlane WHERE id = $1';
        const athleteQueryValues = [athleteId];
        const athleteResult = await pool.query(athleteQuery, athleteQueryValues);
        const gender = athleteResult.rows[0]?.sugu;

        if (!gender) {
            return res.status(404).send('Athlete not found');
        }

        const calculator = new Calculator(event, bestResult, ageGroup);
        const points = calculator.calculatePoints(gender);

        const query = 'INSERT INTO tulemus (sportlane_id, ala, vanusegrupp, tulemus, punktid) VALUES ($1, $2, $3, $4, $5) RETURNING punktid';
        const values = [athleteId, event, ageGroup, bestResult, points];
        const result = await pool.query(query, values);

        res.json({ points: result.rows[0].punktid });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getResults = async (_req, res) => {
    try {
        const query = `
            SELECT 
                sportlane.eesnimi, 
                sportlane.perenimi, 
                sportlane.sugu, 
                tulemus.ala, 
                tulemus.vanusegrupp, 
                tulemus.tulemus, 
                tulemus.punktid
            FROM 
                tulemus
            INNER JOIN 
                sportlane ON tulemus.sportlane_id = sportlane.id;
        `;
        
        const results = await pool.query(query);
        res.json(results.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
