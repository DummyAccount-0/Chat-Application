import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['direct', 'team'],
    required: true
  },
  // For direct messages
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For team messages
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ team: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);