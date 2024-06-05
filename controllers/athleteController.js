const Athlete = require('../models/athlete');
const pool = require('../db/database');

exports.checkAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.query;

    try {
        const athlete = await Athlete.findByName(pool, firstName, lastName, gender);
        if (athlete) {
            res.json({ exists: true, athleteId: athlete.id });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.createAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.body;

    if (!firstName || !lastName || !gender) {
        return res.status(400).send('Sisesta eesnimi, perenimi ja sugu');
    }

    try {
        const athlete = await Athlete.create(pool, firstName, lastName, gender);
        res.json({ athleteId: athlete.id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getFirstNames = async (req, res) => {
    const { prefix } = req.query;

    try {
        const firstNames = await Athlete.getFirstNames(pool, prefix);
        res.json(firstNames);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLastNames = async (req, res) => {
    const { prefix } = req.query;

    try {
        const lastNames = await Athlete.getLastNames(pool, prefix);
        res.json(lastNames);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
