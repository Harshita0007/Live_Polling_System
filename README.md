# Live Polling System

A real-time polling application built with React frontend and Node.js backend using Socket.io for real-time communication.

## Features

- **Real-time Polling**: Create and participate in live polls with instant results
- **Teacher Dashboard**: Create polls, view results, and manage students
- **Student Interface**: Join polls, submit answers, and see real-time results
- **Live Updates**: Real-time user count and poll results using Socket.io
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Poll History**: View past polls and their results

## Project Structure

```
Polling/
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file with Socket.io
│   ├── package.json        # Backend dependencies
│   └── package-lock.json   # Backend lock file
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── ...
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── package.json           # Root package.json with scripts
└── README.md             # This file
```

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Polling
```

2. Install all dependencies:

```bash
npm run install-all
```

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Running Separately

**Backend only:**

```bash
npm run server
```

**Frontend only:**

```bash
npm run client
```

**Production build:**

```bash
npm run build
npm start
```

## Usage

1. **Start the application** using `npm run dev`
2. **Open your browser** and go to `http://localhost:3000`
3. **Choose your role:**
   - **Teacher**: Create polls, view results, manage students
   - **Student**: Join polls, submit answers, see results
4. **For Teachers:**
   - Create new polls with custom questions and options
   - Set time limits for polls
   - View real-time results and user count
   - Access poll history
5. **For Students:**
   - Enter your name to join
   - Wait for polls to be created
   - Submit answers and see real-time results

## API Endpoints

### Backend API (Port 5000)

- `GET /api/health` - Server health check
- `GET /api/current-poll` - Get current active poll
- `GET /api/poll-history` - Get poll history
- `POST /api/polls` - Create a new poll
- `POST /api/polls/:pollId/answer` - Submit poll answer
- `GET /api/connected-users` - Get connected users
- `POST /api/kick-user` - Kick a user from the session

### Socket.io Events

**Client to Server:**

- `user-join` - Join as teacher or student
- `submit-answer` - Submit poll answer
- `send-chat-message` - Send chat message

**Server to Client:**

- `user-joined` - User successfully joined
- `new-poll` - New poll created
- `poll-results-updated` - Poll results updated
- `poll-ended` - Poll has ended
- `user-count-updated` - User count changed
- `user-kicked` - User was kicked

## Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend

- **React** - UI library
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling framework
- **Recharts** - Chart library for results

## Development

### Adding New Features

1. **Backend changes**: Modify files in the `backend/` directory
2. **Frontend changes**: Modify files in the `frontend/src/` directory
3. **Socket events**: Update both client and server event handlers

### Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Deployment

### Backend Deployment

1. Set environment variables for production
2. Run `npm run build` in frontend directory
3. Serve the built files from the backend
4. Deploy to your preferred hosting service

### Frontend Deployment

1. Run `npm run build` in frontend directory
2. Deploy the `build` folder to your hosting service
3. Update backend CORS settings for production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
