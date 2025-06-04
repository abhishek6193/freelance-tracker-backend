import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taskId?: Types.ObjectId;
}

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  timeEntryIds: Types.ObjectId[];
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  pdfUrl?: string;
  sentAt?: Date;
  paidAt?: Date;
  lineItems?: IInvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceLineItemSchema = new Schema<IInvoiceLineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  timeEntryIds: [{ type: Schema.Types.ObjectId, ref: 'TimeEntry' }],
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
  pdfUrl: { type: String },
  sentAt: { type: Date },
  paidAt: { type: Date },
  lineItems: { type: [InvoiceLineItemSchema], default: undefined },
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
