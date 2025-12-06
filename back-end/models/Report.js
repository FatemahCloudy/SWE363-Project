import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required']
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedMemoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
    enum: ['spam', 'harassment', 'inappropriate', 'copyright', 'other']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  resolution: {
    type: String,
    maxlength: [500, 'Resolution cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
