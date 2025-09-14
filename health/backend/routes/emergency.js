import express from 'express';
import mongoose from 'mongoose';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Initialize env variables
dotenv.config();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const router = express.Router();

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\+[1-9]\d{1,14}$/.test(v); // Enforce E.164 format
      },
      message: 'Phone must be in E.164 format (e.g., +12345678901)'
    }
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['Family', 'Friend', 'Colleague', 'Doctor', 'Other'],
    default: 'Other'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: String,
    required: true,
    default: 'default_user'
  }
}, {
  timestamps: true
});

// Ensure only one primary contact per user
contactSchema.pre('save', async function(next) {
  if (this.isModified('isPrimary') && this.isPrimary) {
    await mongoose.model('Contact').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

contactSchema.index({ userId: 1, isActive: 1 });

const Contact = mongoose.model('Contact', contactSchema);

// Emergency Log Schema
const emergencyLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default_user' },
  type: { type: String, enum: ['SOS', 'CALL'], required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    latitude: Number,
    longitude: Number
  },
  contactsNotified: [{
    contactId: String,
    name: String,
    phone: String,
    messageSid: String,
    status: { 
      type: String, 
      enum: ['PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'UNDELIVERED', 'CANCELED'], 
      default: 'PENDING' 
    },
    error: String,
    statusUpdatedAt: Date
  }],
  message: String,
  status: { type: String, enum: ['PENDING', 'SENT', 'PARTIAL', 'FAILED'], default: 'PENDING' }
});

const EmergencyLog = mongoose.model('EmergencyLog', emergencyLogSchema);

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const contacts = await Contact.find({ 
      userId: userId, 
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
});

// Get a single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact || !contact.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
});

// Create a contact
router.post('/', async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;
    const userId = req.body.userId || 'default_user';
    
    // Normalize phone number
    const parsed = parsePhoneNumberFromString(phone, 'US');
    if (!parsed || !parsed.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number'
      });
    }
    
    const newContact = new Contact({
      name,
      phone: parsed.number,
      relationship,
      isPrimary: isPrimary || false,
      userId
    });
    const savedContact = await newContact.save();
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: savedContact
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating contact',
      error: error.message
    });
  }
});

// Update a contact
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;
    
    // Normalize phone number
    if (phone) {
        const parsed = parsePhoneNumberFromString(phone, 'US');
        if (!parsed || !parsed.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number'
            });
        }
        req.body.phone = parsed.number;
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
});

// Delete a contact (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
});

// Send SOS to all contacts with current location
router.post('/sos', async (req, res) => {
  try {
    const { userId = 'default_user', customMessage, latitude, longitude } = req.body;

    // Fetch active contacts
    const contacts = await Contact.find({ userId, isActive: true });
    if (!contacts.length) {
      return res.status(400).json({
        success: false,
        message: 'No active contacts found to send SOS.'
      });
    }

    // Construct message
    let messageBody = customMessage || 'This is an emergency alert. Please check on me immediately.';
    if (latitude && longitude) {
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      messageBody += `\nMy location: ${mapsLink}`;
    }

    // Create emergency log
    const emergencyLog = new EmergencyLog({
      userId,
      type: 'SOS',
      location: { latitude, longitude },
      message: messageBody,
      contactsNotified: contacts.map(c => ({
        contactId: c._id.toString(),
        name: c.name,
        phone: c.phone,
        status: 'PENDING'
      })),
      status: 'PENDING'
    });

    await emergencyLog.save();

    // Send SMS via Twilio
    const results = await Promise.all(contacts.map(async (contact) => {
      try {
        const message = await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.phone,
          statusCallback: `${process.env.APP_BASE_URL}/api/emergency/twilio/status`
        });
        const contactEntry = emergencyLog.contactsNotified.find(c => c.contactId === contact._id.toString());
        if (contactEntry) {
          contactEntry.messageSid = message.sid;
          contactEntry.status = message.status.toUpperCase();
        }
        return { contactId: contact._id, status: message.status, sid: message.sid };
      } catch (error) {
        const contactEntry = emergencyLog.contactsNotified.find(c => c.contactId === contact._id.toString());
        if (contactEntry) {
          contactEntry.status = 'FAILED';
          contactEntry.error = error.message;
        }
        return { contactId: contact._id, status: 'FAILED', error: error.message };
      }
    }));

    const allFailed = results.every(r => r.status === 'FAILED');
    const someFailed = results.some(r => r.status === 'FAILED');
    emergencyLog.status = allFailed ? 'FAILED' : someFailed ? 'PARTIAL' : 'SENT';
    await emergencyLog.save();

    res.status(200).json({
      success: true,
      message: 'SOS request initiated successfully.',
      data: {
        emergencyLogId: emergencyLog._id.toString(),
        contactsNotified: results
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing SOS request',
      error: error.message
    });
  }
});

// Set primary contact
router.patch('/:id/primary', async (req, res) => {
  try {
    const contactToUpdate = await Contact.findById(req.params.id);
    
    if (!contactToUpdate || !contactToUpdate.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contactToUpdate.isPrimary = true;
    await contactToUpdate.save();
    
    const updatedContact = await Contact.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Primary contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating primary contact',
      error: error.message
    });
  }
});

// Twilio status callback
router.post('/twilio/status', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;
    
    const logs = await EmergencyLog.find({ 'contactsNotified.messageSid': MessageSid });
    
    for (const log of logs) {
      const contactNotified = log.contactsNotified.find(c => c.messageSid === MessageSid);
      if (contactNotified) {
        contactNotified.status = MessageStatus.toUpperCase();
        contactNotified.statusUpdatedAt = new Date();
        if (ErrorCode) contactNotified.error = `${ErrorCode}: ${ErrorMessage}`;
        await log.save();
      }
    }
    
    res.set('Content-Type', 'text/xml');
    res.status(200).send('<Response></Response>');
  } catch (error) {
    res.set('Content-Type', 'text/xml');
    res.status(200).send('<Response></Response>');
  }
});

// Get emergency logs
router.get('/logs', async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const logs = await EmergencyLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await EmergencyLog.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: logs.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency logs',
      error: error.message
    });
  }
});
// Add this new route to backend/routes/emergency.js

// Make an automated call to the emergency helpline
router.post('/call-helpline', async (req, res) => {
  const helplineNumber = '+919391871042'; // The hardcoded emergency number
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  // TwiML (Twilio Markup Language) provides instructions for Twilio on what to do when the call connects.
  // In this case, it will use text-to-speech to say the message inside the <Say> tags.
  const twimlInstructions = 
    '<Response><Say language="en-IN">This is an automated emergency alert. Please respond to the situation immediately. Repeating, this is an emergency alert.</Say></Response>';

  try {
    const call = await twilioClient.calls.create({
      twiml: twimlInstructions,
      to: helplineNumber,
      from: twilioNumber,
    });

    console.log(`Call initiated to helpline. SID: ${call.sid}`);

    res.status(200).json({
      success: true,
      message: `Call successfully initiated to ${helplineNumber}.`,
      sid: call.sid
    });
  } catch (error) {
    console.error('Error initiating Twilio call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate emergency call.',
      error: error.message
    });
  }
});
export default router;
