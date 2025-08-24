import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  userId: string; // Reference to the user who owns this contact
  name: string;
  phoneNumber: string;
  relationship?: string;
  isEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true // For faster queries by user
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+91[0-9]{10}$/, 'Phone number must be in +91XXXXXXXXXX format']
  },
  relationship: {
    type: String,
    trim: true,
    maxlength: [30, 'Relationship cannot be more than 30 characters']
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for faster queries by user and phone number
contactSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);
