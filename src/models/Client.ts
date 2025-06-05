import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient extends Document {
  userId: Types.ObjectId;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  llp?: string; // Optional LLP field
  tags?: string[]; // Optional tags field
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  contactEmail: { type: String },
  contactPhone: { type: String },
  notes: { type: String },
  llp: { type: String }, // Optional
  tags: { type: [String], default: undefined }, // Optional
}, { timestamps: true });

export default mongoose.model<IClient>('Client', ClientSchema);
