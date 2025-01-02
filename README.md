# PlanToMeet

[PlanToMeet](https://plantomeet.netlify.app/) is a web application designed to help users manage and schedule time blocks for meetings.

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
