import mongoose from 'mongoose';

const emergencyLogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  location: { type: String },
  contactsNotified: [
    {
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      name: String,
      phone: String,
      messageSid: String,
      status: { type: String, enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'], default: 'PENDING' },
      statusUpdatedAt: Date
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('EmergencyLog', emergencyLogSchema);
