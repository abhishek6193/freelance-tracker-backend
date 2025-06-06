import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  hourlyRate?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  hourlyRate: { type: Number },
  dueDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
