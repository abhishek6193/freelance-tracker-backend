import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // optional for Google OAuth
  googleId?: string;
  role: 'user' | 'admin';
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  hourlyRate: { type: Number },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
