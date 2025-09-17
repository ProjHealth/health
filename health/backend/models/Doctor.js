// models/Doctor.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  reviews: Number,
  appointments: [
    {
      patientId: String,
      time: Date
    }
  ]
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor; // ✅ ESM export
