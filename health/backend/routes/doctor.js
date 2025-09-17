import express from "express";
const router = express.Router();

// Hardcoded example doctors
const exampleDoctors = [
  {
    _id: "1",
    name: "Dr. Meera Sharma",
    specialization: "Psychiatrist",
    experience: 10,
    patientsType: ["Adults", "Teenagers"],
    reviews: [
      { patient: "Anjali", rating: 5, comment: "Very kind and helpful" },
      { patient: "Rohit", rating: 4, comment: "Good listener" }
    ],
    appointments: []
  },
  {
    _id: "2",
    name: "Dr. Ramesh Kumar",
    specialization: "Therapist",
    experience: 8,
    patientsType: ["Children", "Couples"],
    reviews: [
      { patient: "Sneha", rating: 5, comment: "Very supportive" }
    ],
    appointments: []
  }
];

// GET /api/professionals/recommended
router.get("/recommended", (req, res) => {
  res.json(exampleDoctors); // <-- returning hardcoded doctors
});

// POST /api/professionals/book (optional for testing)
router.post("/book", (req, res) => {
  const { doctorId, slot, patientId } = req.body;

  // Find doctor in example list
  const doctor = exampleDoctors.find(doc => doc._id === doctorId);
  if (!doctor) return res.status(404).json({ message: "Doctor not found!" });

  // Check for clash
  const clash = doctor.appointments.find(app => app.time === slot);
  if (clash) return res.status(400).json({ message: "Slot already booked!" });

  doctor.appointments.push({ patientId, time: slot });
  res.json({ message: "Appointment booked successfully!" });
});

// POST /api/professionals/:id/review
router.post("/:id/review", async (req, res) => {
  const { id } = req.params;
  const { patientId, rating, comment } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.reviews.push({ patient: patientId, rating, comment });
    await doctor.save();

    res.json({ message: "Review added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
