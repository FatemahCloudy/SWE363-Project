import mongoose from 'mongoose';

const savedMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory',
    required: [true, 'Memory ID is required']
  }
}, {
  timestamps: true
});

savedMemorySchema.index({ userId: 1, memoryId: 1 }, { unique: true });
savedMemorySchema.index({ userId: 1 });

const SavedMemory = mongoose.model('SavedMemory', savedMemorySchema);

export default SavedMemory;
