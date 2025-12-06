import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'message', 'system', 'mention'],
    required: [true, 'Notification type is required']
  },
  content: {
    type: String,
    required: [true, 'Notification content is required'],
    maxlength: [500, 'Notification content cannot exceed 500 characters']
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedMemoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
