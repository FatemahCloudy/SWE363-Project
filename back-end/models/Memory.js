import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  imageUrl: {
    type: String
  },
  category: {
    type: String,
    enum: ['travel', 'family', 'friends', 'food', 'nature', 'adventure', 'culture', 'other'],
    default: 'other'
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'followers_only'],
    default: 'public'
  },
  location: {
    type: String,
    maxlength: [200, 'Location name cannot exceed 200 characters']
  },
  locationAddress: {
    type: String,
    maxlength: [300, 'Location address cannot exceed 300 characters']
  },
  latitude: {
    type: Number,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  tags: [{
    type: String,
    trim: true
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isCollaborative: {
    type: Boolean,
    default: false
  },
  sharedGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedMemoryGroup'
  },
  isGroupHost: {
    type: Boolean,
    default: false
  },
  collaboratorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  eventName: {
    type: String,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  eventDate: {
    type: Date
  }
}, {
  timestamps: true
});

memorySchema.index({ userId: 1 });
memorySchema.index({ privacy: 1 });
memorySchema.index({ category: 1 });
memorySchema.index({ createdAt: -1 });
memorySchema.index({ title: 'text', description: 'text', location: 'text' });
memorySchema.index({ latitude: 1, longitude: 1 });
memorySchema.index({ sharedGroupId: 1 });
memorySchema.index({ isCollaborative: 1 });

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
