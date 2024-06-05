const Calculator = require('../models/calculator');
const pool = require('../db/database');

exports.calculatePointsAndSaveResult = async (req, res) => {
    const { athleteId, event, bestResult, ageGroup } = req.body;

    if (!athleteId || !event || bestResult === undefined || !ageGroup) {
        return res.status(400).send('Sisesta sportlase id, ala, tulemus ja vanuse grupp');
    }

    try {
        const athleteQuery = 'SELECT sugu FROM sportlane WHERE id = $1';
        const athleteQueryValues = [athleteId];
        const athleteResult = await pool.query(athleteQuery, athleteQueryValues);
        const gender = athleteResult.rows[0]?.gender;


        // let sql = 'SELECT sugu FROM sportlane WHERE id = $1';
        // let sqlResult = [];
        // pool.query(sql, (err, result) => {
        //     if (err) {
        //
        //     } else {
        //
        //     }
        // })



        if (!gender) {
            return res.status(404).send('Athlete not found');
        }

        const calculator = new Calculator(event, bestResult, ageGroup);
        const points = calculator.calculatePoints(gender);

        const query = 'INSERT INTO tulemus (sportlane_id, ala, vanusegrupp, tulemus, punktid) VALUES ($1, $2, $3, $4, $5)';
        const values = [athleteId, event, ageGroup, bestResult, points];
        const result = await pool.query(query, values);


        res.json({ points: result.rows[0].punktid });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getResults = async (req, res) => {
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

exports.updateResult = async (req, res) => {
    const { id } = req.params;
    const { meetrid } = req.body;

    try {
        const query = `
            UPDATE tulemus
            SET meetrid = $1
            WHERE id = $2;
        `;

        const values = [meetrid, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            res.status(404).send('Result not found');
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteResult = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM tulemus
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            res.status(404).send('Result not found');
        } else {
            res.json({ message: 'Result deleted successfully' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const season = req.query.season;

        let query;
        let queryParams;

        if (season) {
            query = `
                SELECT
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    tulemus.vanusegrupp,
                    tulemus.hooaeg,
                    SUM(tulemus.punktid) AS punktid_sum
                FROM
                    edetabel
                        JOIN
                    sportlane ON edetabel.sportlane_id = sportlane.id
                        JOIN
                    tulemus ON edetabel.sportlane_id = tulemus.sportlane_id
                WHERE
                    tulemus.hooaeg = $1
                GROUP BY
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    edetabel.vanusegrupp,
                    edetabel.hooaeg
                ORDER BY
                    punktid_sum DESC;
            `;
            queryParams = [season];
        } else {
            query = `
                SELECT
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    tulemus.vanusegrupp,
                    tulemus.hooaeg,
                    SUM(tulemus.punktid) AS punktid_sum
                FROM
                    edetabel
                        JOIN
                    sportlane ON edetabel.sportlane_id = sportlane.id
                        JOIN
                    tulemus ON edetabel.sportlane_id = tulemus.sportlane_id
                WHERE
                    tulemus.hooaeg = (SELECT MAX(hooaeg) FROM tulemus)
                GROUP BY
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    edetabel.vanusegrupp,
                    edetabel.hooaeg
                ORDER BY
                    punktid_sum DESC;
            `;
            queryParams = [];
        }

        const results = await pool.query(query, queryParams);
        res.json(results.rows);
    }  catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}