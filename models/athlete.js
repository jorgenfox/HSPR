class Athlete {
    constructor(id, firstName, lastName, gender) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
    }

    static async findByName(pool, firstName, lastName, gender) {
        const query = 'SELECT id FROM sportlane WHERE eesnimi = $1 AND perenimi = $2 AND sugu = $3';
        const values = [firstName, lastName, gender];
        const result = await pool.query(query, values);
        return result.rows[0] ? new Athlete(result.rows[0].id, firstName, lastName, gender) : null;
    }

    static async create(pool, firstName, lastName, gender) {
        const query = 'INSERT INTO sportlane (eesnimi, perenimi, sugu) VALUES ($1, $2, $3) RETURNING id';
        const values = [firstName, lastName, gender];
        const result = await pool.query(query, values);
        return new Athlete(result.rows[0].id, firstName, lastName, gender);
    }

    static async getFirstNames(pool, prefix) {
        const query = 'SELECT eesnimi, perenimi, sugu FROM sportlane WHERE eesnimi ILIKE $1 LIMIT 10';
        const values = [`${prefix}%`];
        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getLastNames(pool, prefix) {
        const query = 'SELECT eesnimi, perenimi, sugu FROM sportlane WHERE perenimi ILIKE $1 LIMIT 10';
        const values = [`${prefix}%`];
        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = Athlete;
