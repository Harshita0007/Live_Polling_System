// models/Poll.js
class Poll {
  constructor(data) {
    this.id = data.id;
    this.question = data.question;
    this.options = data.options || [];
    this.timeLimit = data.timeLimit || 60;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.createdBy = data.createdBy;
    this.answers = new Map(); // studentId -> optionId
    this.startTime = data.startTime || Date.now();
    this.endedAt = data.endedAt || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  addAnswer(studentId, optionId) {
    if (this.answers.has(studentId)) {
      throw new Error('Student has already answered this poll');
    }

    const option = this.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Invalid option selected');
    }

    this.answers.set(studentId, optionId);
    option.votes = (option.votes || 0) + 1;
    
    return true;
  }

  removeAnswer(studentId) {
    if (!this.answers.has(studentId)) {
      return false;
    }

    const optionId = this.answers.get(studentId);
    const option = this.options.find(opt => opt.id === optionId);
    
    if (option && option.votes > 0) {
      option.votes--;
    }

    this.answers.delete(studentId);
    return true;
  }

  getResults() {
    const totalVotes = this.answers.size;
    
    return this.options.map(option => ({
      id: option.id,
      text: option.text,
      votes: option.votes || 0,
      percentage: totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0
    }));
  }

  getRemainingTime() {
    if (!this.isActive || this.endedAt) return 0;
    
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const remaining = Math.max(0, this.timeLimit - elapsed);
    
    return remaining;
  }

  end() {
    this.isActive = false;
    this.endedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      question: this.question,
      options: this.options,
      timeLimit: this.timeLimit,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
      startTime: this.startTime,
      endedAt: this.endedAt,
      isActive: this.isActive,
      totalAnswers: this.answers.size,
      results: this.getResults()
    };
  }
}