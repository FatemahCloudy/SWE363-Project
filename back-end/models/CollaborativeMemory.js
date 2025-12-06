import mongoose from 'mongoose';

const collaborativeMemorySchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedMemoryGroup',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  mediaUrls: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    caption: {
      type: String,
      maxlength: 500
    }
  }],
  imageUrl: {
    type: String
  },
  perspective: {
    type: String,
    trim: true,
    maxlength: [100, 'Perspective label cannot exceed 100 characters']
  },
  mood: {
    type: String,
    enum: ['happy', 'nostalgic', 'excited', 'peaceful', 'grateful', 'funny', 'emotional', 'adventurous'],
  },
  visibility: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

collaborativeMemorySchema.index({ groupId: 1, createdAt: -1 });
collaborativeMemorySchema.index({ authorId: 1 });
collaborativeMemorySchema.index({ groupId: 1, authorId: 1 });
collaborativeMemorySchema.index({ visibility: 1 });

collaborativeMemorySchema.methods.isAuthor = function(userId) {
  return this.authorId.toString() === userId.toString();
};

collaborativeMemorySchema.statics.getEntriesForGroup = async function(groupId, options = {}) {
  const { visibility = 'published', limit = 50, skip = 0 } = options;
  
  const query = { groupId };
  if (visibility !== 'all') {
    query.visibility = visibility;
  }
  
  return this.find(query)
    .populate('authorId', 'username fullName avatarUrl')
    .sort({ order: 1, createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

collaborativeMemorySchema.statics.getEntryByAuthor = async function(groupId, authorId) {
  return this.findOne({ groupId, authorId })
    .populate('authorId', 'username fullName avatarUrl');
};

const CollaborativeMemory = mongoose.model('CollaborativeMemory', collaborativeMemorySchema);

export default CollaborativeMemory;
