
# Live Polling System

A real-time interactive polling application that enables teachers to create polls and students to participate in live Q&A sessions with instant results and chat functionality.

## 🚀 Features

### For Teachers
- **Create Interactive Polls**: Design multiple-choice questions with customizable time limits
- **Real-time Results**: View live voting results as students submit answers
- **Participant Management**: See all connected students and manage participation
- **Poll History**: Access previously created polls and their results
- **User Moderation**: Kick disruptive users from the session
- **Live Chat Monitoring**: Monitor student discussions

### For Students
- **Join Sessions**: Easy room-based joining with just a name
- **Interactive Voting**: Select answers with intuitive interface
- **Real-time Feedback**: See results immediately after submission
- **Live Chat**: Communicate with other students during sessions
- **Participant List**: View other connected students

### System Features
- **Real-time Communication**: WebSocket-based instant updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Connection Status**: Visual indicators for connection health
- **Auto-reconnection**: Handles network interruptions gracefully

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **Real-time Communication**: Socket.IO
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel
- **State Management**: React useState/useEffect

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- A Socket.IO server (backend)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/live-polling-system.git
   cd live-polling-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SOCKET_URL=your-socket-server-url
   REACT_APP_API_URL=your-api-url
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Create vercel.json** in your project root:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add your `REACT_APP_SOCKET_URL` and other variables

## 📁 Project Structure

```
live-polling-system/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── BrandPill.js
│   │   ├── RoleSelection.js
│   │   ├── StudentOnboarding.js
│   │   ├── WaitingScreen.js
│   │   ├── StudentQuestion.js
│   │   ├── PollResults.js
│   │   ├── TeacherDashboard.js
│   │   ├── PollHistory.js
│   │   ├── ChatDock.js
│   │   └── KickedScreen.js
│   ├── services/
│   │   └── socketService.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
├── vercel.json
└── README.md
```

## 🎯 Usage

### Getting Started

1. **Access the Application**
   - Open your deployed URL or `http://localhost:3000`

2. **Choose Your Role**
   - Select "Teacher" to create and manage polls
   - Select "Student" to join and participate in polls

### For Teachers

1. **Create a Poll**
   - Enter your question
   - Add multiple choice options (minimum 2)
   - Set time limit (in seconds)
   - Click "Create Poll" to start

2. **Manage Active Polls**
   - Monitor real-time responses
   - View participant list
   - End poll manually or let timer expire
   - Access poll history

3. **Moderate Session**
   - Kick disruptive users
   - Monitor chat conversations

### For Students

1. **Join Session**
   - Enter your name
   - Join the default room or specified room

2. **Participate**
   - Wait for teacher to create polls
   - Select your answer when poll appears
   - Submit before time expires
   - View results after submission

3. **Interact**
   - Chat with other students
   - See who else is in the session

## 🔧 Configuration

### Socket Service Configuration

Update `src/services/socketService.js` with your server details:

```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
```

### Customizing Styles

The app uses Tailwind CSS. Modify styles in:
- `src/App.css` for global styles
- Individual component files for component-specific styles

## 🐛 Troubleshooting

### Common Issues

1. **404 Error on Deployed Site**
   - Ensure `vercel.json` exists with proper rewrites
   - Check that build output is correct

2. **Socket Connection Issues**
   - Verify `REACT_APP_SOCKET_URL` environment variable
   - Check if backend server is running
   - Ensure CORS is configured on backend

3. **Polls Not Appearing**
   - Check browser console for Socket.IO errors
   - Verify room ID matches between teacher and students
   - Ensure both users are connected to the same server

4. **Chat Not Working**
   - Verify Socket.IO message events are properly configured
   - Check network connectivity
   - Ensure proper user authentication

### Debug Mode

Enable debug information by setting:
```env
NODE_ENV=development
```

This will show a debug panel with current state information.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO team for real-time communication
- Tailwind CSS for styling framework
- Lucide React for beautiful icons
- Vercel for hosting platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/live-polling-system/issues)
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Multiple room support
- [ ] User authentication
- [ ] Poll analytics and statistics
- [ ] File sharing capabilities
- [ ] Mobile app version
- [ ] Integration with learning management systems
- [ ] Advanced question types (true/false, text input)
- [ ] Poll scheduling
- [ ] Export results to CSV/PDF

---

**Made with ❤️ for interactive learning**