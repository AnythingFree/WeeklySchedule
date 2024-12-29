const fs = require('fs');
const path = require('path');

// Path to the data.json file
const dataFilePath = path.join(__dirname, 'data.json');

// Utility function to read the data file
const readDataFile = () => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return []; // Default to an empty array if the file doesn't exist
};

// Utility function to write to the data file
const writeDataFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

exports.handler = async (event) => {
    if (event.httpMethod === 'GET') {
        try {
            const timeBlocks = readDataFile();
            return {
                statusCode: 200,
                body: JSON.stringify(timeBlocks),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error reading time blocks' }),
            };
        }
    } else if (event.httpMethod === 'POST') {
        try {
            const timeBlocks = JSON.parse(event.body);
            writeDataFile(timeBlocks);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Time blocks updated successfully' }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error saving time blocks' }),
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
};
