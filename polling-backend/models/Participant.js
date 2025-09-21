// models/Participant.js
class Participant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role; // 'student' or 'teacher'
    this.socketId = data.socketId;
    this.hasAnswered = data.hasAnswered || false;
    this.joinedAt = data.joinedAt || new Date().toISOString();
    this.lastActive = data.lastActive || new Date().toISOString();
    this.isOnline = data.isOnline !== undefined ? data.isOnline : true;
  }

  updateActivity() {
    this.lastActive = new Date().toISOString();
  }

  setAnswered(hasAnswered = true) {
    this.hasAnswered = hasAnswered;
    this.updateActivity();
  }

  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    if (isOnline) {
      this.updateActivity();
    }
  }

  resetAnswerStatus() {
    this.hasAnswered = false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      hasAnswered: this.hasAnswered,
      joinedAt: this.joinedAt,
      lastActive: this.lastActive,
      isOnline: this.isOnline
    };
  }
}
