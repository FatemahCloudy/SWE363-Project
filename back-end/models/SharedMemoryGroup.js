import mongoose from 'mongoose';

const sharedMemoryGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Group title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  hostMemoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  locationAddress: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  eventDate: {
    type: Date
  },
  eventName: {
    type: String,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'followers_only', 'collaborators_only'],
    default: 'collaborators_only'
  },
  invitedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    }
  }],
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  contributorCount: {
    type: Number,
    default: 0
  },
  entryCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  allowNewContributions: {
    type: Boolean,
    default: true
  },
  coverImageUrl: {
    type: String
  }
}, {
  timestamps: true
});

sharedMemoryGroupSchema.index({ ownerId: 1 });
sharedMemoryGroupSchema.index({ hostMemoryId: 1 });
sharedMemoryGroupSchema.index({ contributors: 1 });
sharedMemoryGroupSchema.index({ 'invitedUsers.userId': 1 });
sharedMemoryGroupSchema.index({ status: 1, createdAt: -1 });

sharedMemoryGroupSchema.methods.isOwner = function(userId) {
  return this.ownerId.toString() === userId.toString();
};

sharedMemoryGroupSchema.methods.isContributor = function(userId) {
  return this.contributors.some(c => c.toString() === userId.toString());
};

sharedMemoryGroupSchema.methods.isInvited = function(userId) {
  return this.invitedUsers.some(
    inv => inv.userId.toString() === userId.toString() && inv.status === 'pending'
  );
};

sharedMemoryGroupSchema.methods.canView = async function(userId, Follow) {
  if (this.privacy === 'public') return true;
  if (this.isOwner(userId)) return true;
  if (this.isContributor(userId)) return true;
  
  if (this.privacy === 'followers_only' && Follow) {
    const isFollower = await Follow.findOne({
      followerId: userId,
      followingId: this.ownerId
    });
    if (isFollower) return true;
  }
  
  return false;
};

sharedMemoryGroupSchema.methods.canViewSync = function(userId) {
  if (this.privacy === 'public') return true;
  if (this.isOwner(userId)) return true;
  if (this.isContributor(userId)) return true;
  if (this.privacy === 'collaborators_only') return false;
  return false;
};

sharedMemoryGroupSchema.methods.canContribute = function(userId) {
  if (this.status !== 'active') return false;
  if (!this.allowNewContributions) return false;
  if (this.isOwner(userId)) return true;
  if (this.isContributor(userId)) return true;
  return false;
};

const SharedMemoryGroup = mongoose.model('SharedMemoryGroup', sharedMemoryGroupSchema);

export default SharedMemoryGroup;
