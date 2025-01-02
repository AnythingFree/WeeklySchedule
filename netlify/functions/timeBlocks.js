require('dotenv').config();

const { Pool } = require('pg');

// Configure the database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Get the database URL from environment variables
    ssl: { rejectUnauthorized: false }, // Use SSL for Neon or other cloud-hosted databases
});

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'POST') {
            const block = JSON.parse(event.body);

            const { day, fromTime, toTime } = block;
                await pool.query(
                    'INSERT INTO timeBlocks (day, start_time, end_time) VALUES ($1, $2, $3)',
                    [day, fromTime, toTime]
            );
            

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Time blocks saved successfully' }),
            };
        } else if (event.httpMethod === 'GET') {
            const result = await pool.query('SELECT * FROM timeBlocks');
            return {
                statusCode: 200,
                body: JSON.stringify(result.rows),
            };
        } else if (event.httpMethod === 'DELETE') {
            const id = event.path.split('/').pop(); // Extract the ID from the URL
            try {
                const result = await pool.query('DELETE FROM timeBlocks WHERE id = $1', [id]);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Time block deleted successfully', id }),
                };
            } catch (error) {
                console.error('Error deleting time block:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Error deleting time block' }),
                };
            };
        } else if (event.httpMethod === 'PUT') {
            const block = JSON.parse(event.body);

            const { id, day, fromTime, toTime } = block;
            if (!id) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'ID is required for updating a time block' }),
                };
            }

            try {
                const result = await pool.query(
                    'UPDATE timeBlocks SET day = $1, start_time = $2, end_time = $3 WHERE id = $4',
                    [day, fromTime, toTime, id]
                );

                if (result.rowCount === 0) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Time block not found' }),
                    };
                }

                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Time block updated successfully', id }),
                };
            } catch (error) {
                console.error('Error updating time block:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Error updating time block' }),
                };
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
