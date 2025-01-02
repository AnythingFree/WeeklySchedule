# PlanToMeet

[PlanToMeet](https://plantomeet.netlify.app/) is a simple web application designed to help me schedule meetings with friends.

## Technologies Used

- **[Node.js](https://nodejs.org/)**: Used for backend logic and serverless functions.
- **[Netlify](https://www.netlify.com/)**: Hosts the application and powers serverless functions.
- **[Neon (PostgreSQL)](https://neon.tech/)**: Provides the PostgreSQL database for storing and managing data.

## Getting Started

1. Visit the app: [PlanToMeet](https://plantomeet.netlify.app/)
2. Create, edit, and manage your time blocks.

## How It Works

1. **Database**: All time blocks are stored in a remote PostgreSQL database hosted on Neon.
2. **Backend**: Serverless functions written in Node.js handle database interactions, such as fetching, adding, updating, and deleting time blocks.
3. **Frontend**: A dynamic web interface hosted on Netlify allows users to interact with the schedule in real time.

## TODO (Maybe)
1. Add input IDs.
2. Enable real-time updates so that when one user makes a change, it is instantly reflected for all other users viewing the app.
