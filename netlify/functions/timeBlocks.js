let timeBlocks = []; // In-memory storage

exports.handler = async (event) => {
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify(timeBlocks),
        };
    } else if (event.httpMethod === 'POST') {
        timeBlocks = JSON.parse(event.body); // Update blocks
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Time blocks updated successfully' }),
        };
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
};
