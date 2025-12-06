import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory',
    required: [true, 'Memory ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

commentSchema.index({ memoryId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
