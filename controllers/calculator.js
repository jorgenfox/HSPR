const pool = require('../src/databasePromise');
const athlete = require('./athlete');
const Points = require('../models/pointsCalc');
const leaderCalc = require('../models/leaderCalc');

// POST tulemuste tabelisse
exports.postPoints = async (req, res) => {
    const { ala, vanusegrupp, athletes } = req.body;
    const hooaeg = new Date().getFullYear();

    if (!ala || !vanusegrupp || !athletes || !Array.isArray(athletes) || athletes.length === 0) {
        return res.status(400).json({ error: 'Kõik väljad on kohustuslikud!' });
    }

    try {
        for (const athleteData of athletes) {
            const { eesnimi, perenimi, sugu, meetrid } = athleteData;

            if (!eesnimi || !perenimi || !sugu || !meetrid) {
                return res.status(400).json({ error: 'Kõik väljad on kohustuslikud iga sportlase jaoks!' });
            }

            // Get or create athlete and retrieve athlete ID
            const athleteId = await athlete.getOrCreateAthlete(eesnimi, perenimi, sugu);

            // Calculate points
            const points = new Points(sugu, ala, meetrid);
            const punktid = points.calculatePoints();

            // Insert the result into the database
            const insertResultSql = 'INSERT INTO tulemus (sportlane_id, ala, vanusegrupp, meetrid, punktid, hooaeg) VALUES (?, ?, ?, ?, ?, ?)';
            await pool.query(insertResultSql, [athleteId, ala, vanusegrupp, meetrid, punktid, hooaeg]);

            // Update the edetabel table
            await updateEdetabel(athleteId, vanusegrupp, hooaeg);
        }

        res.status(200).json({ message: 'Andmed edukalt salvestatud!' });
    } catch (err) {
        console.error('Viga päringu töötlemisel:', err);
        res.status(500).json({ error: 'Päring ebaõnnestus!' });
    }
};


// Function to update the edetabel table
// Function to update the edetabel table
async function updateEdetabel(athleteId, vanusegrupp, hooaeg) {
    try {
        const checkExistingSql = 'SELECT punktid_sum FROM edetabel WHERE sportlane_id = ? AND hooaeg = ? AND vanusegrupp = ?';
        const [existingEntry] = await pool.query(checkExistingSql, [athleteId, hooaeg, vanusegrupp]);

        const queryResultsSql = 'SELECT ala, punktid, meetrid FROM tulemus WHERE sportlane_id = ? AND hooaeg = ? AND vanusegrupp = ?';
        const [results] = await pool.query(queryResultsSql, [athleteId, hooaeg, vanusegrupp]);

        console.log(`Results for athlete ID ${athleteId} in season ${hooaeg}:`, results);

        const pointsData = {};
        results.forEach(result => {
            if (!pointsData[result.ala]) {
                pointsData[result.ala] = [];
            }
            pointsData[result.ala].push({ points: result.punktid, meters: result.meetrid, event: result.ala });
        });

        console.log(`Points data for calculation:`, pointsData);

        if (hasValidEventCounts(pointsData)) {
            const calculator = new leaderCalc(pointsData);
            const { totalPoints: punktidSum, detailedPoints } = calculator.calculateMaxTotalPoints();

            console.log(`Calculated total points: ${punktidSum}`);
            console.log(`Detailed points used for calculation:`, detailedPoints);

            if (existingEntry.length > 0) {
                if (punktidSum > existingEntry[0].punktid_sum) {
                    const updateSql = 'UPDATE edetabel SET punktid_sum = ? WHERE sportlane_id = ? AND hooaeg = ? AND vanusegrupp = ?';
                    await pool.query(updateSql, [punktidSum, athleteId, hooaeg, vanusegrupp]);
                    console.log(`Updated edetabel for athlete ID ${athleteId} with new points: ${punktidSum}`);
                } else {
                    console.log('No update needed as existing points are higher or equal.');
                }
            } else {
                const insertSql = 'INSERT INTO edetabel (sportlane_id, punktid_sum, vanusegrupp, hooaeg) VALUES (?, ?, ?, ?)';
                await pool.query(insertSql, [athleteId, punktidSum, vanusegrupp, hooaeg]);
                console.log(`Inserted new edetabel record for athlete ID ${athleteId} with points: ${punktidSum}`);
            }
        } else {
            console.log(`Not enough valid results to update edetabel for athlete ID ${athleteId}`);
        }
    } catch (err) {
        console.error('Error updating edetabel:', err);
    }
}





// Helper function to check for valid event counts
function hasValidEventCounts(pointsData) {
    let eventCounts = Object.values(pointsData).map(points => points.length);
    eventCounts.sort((a, b) => b - a); // Sort counts in descending order

    // Check for the 3+2+1 pattern
    return eventCounts[0] >= 3 && eventCounts[1] >= 2 && eventCounts[2] >= 1 && pointsData['hüpe'].length >= 2;
}
