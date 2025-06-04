import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITimeEntry extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  taskId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  note?: string;
  isBilled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  note: { type: String },
  isBilled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
