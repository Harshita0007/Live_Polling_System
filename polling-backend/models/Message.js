
// models/Message.js
class Message {
  constructor(data) {
    this.id = data.id;
    this.message = data.message;
    this.userName = data.userName;
    this.userId = data.userId;
    this.role = data.role; // 'student' or 'teacher'
    this.timestamp = data.timestamp || new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    this.createdAt = data.createdAt || new Date().toISOString();
    this.type = data.type || 'message'; // 'message', 'system', 'notification'
  }

  static createSystemMessage(message) {
    return new Message({
      id: require('uuid').v4(),
      message: message,
      userName: 'System',
      role: 'system',
      type: 'system'
    });
  }

  static createNotification(message, userName = 'System') {
    return new Message({
      id: require('uuid').v4(),
      message: message,
      userName: userName,
      role: 'system',
      type: 'notification'
    });
  }

  toJSON() {
    return {
      id: this.id,
      message: this.message,
      userName: this.userName,
      userId: this.userId,
      role: this.role,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      type: this.type
    };
  }
}

module.exports = {
  Poll,
  Participant,
  Message
};