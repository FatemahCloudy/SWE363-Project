import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['like', 'love', 'wow', 'sad'],
    default: 'like'
  }
}, {
  timestamps: true
});

likeSchema.index({ memoryId: 1, userId: 1 }, { unique: true });
likeSchema.index({ memoryId: 1 });
likeSchema.index({ userId: 1 });

const Like = mongoose.model('Like', likeSchema);

export default Like;
