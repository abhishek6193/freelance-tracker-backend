import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  userId: Types.ObjectId;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IClient>('Client', ClientSchema);
