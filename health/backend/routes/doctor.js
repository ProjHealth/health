import express from "express";
const router = express.Router();

// Hardcoded example doctors
const exampleDoctors = [
  // =================== Child Psychologists ===================
  {
    _id: "1",
    name: "Dr. Meera Sharma",
    specialization: "Child Psychologist",
    education: "MBBS, MD Psychiatry",
    officeAddress: "123 Wellness St, Bangalore",
    personalStatement: "Helping children navigate mental challenges with empathy.",
    experience: 10,
    photo: "",
    reviews: [
      { patient: "Anjali", rating: 5, comment: "Very kind and helpful" },
      { patient: "Rohit", rating: 4, comment: "Good listener" }
    ],
    appointments: Array(15).fill({})
  },
  {
    _id: "2",
    name: "Dr. Ramesh Kumar",
    specialization: "Child Psychologist",
    education: "PhD Child Psychology",
    officeAddress: "45 Kids Care Rd, Bangalore",
    personalStatement: "Focused on emotional development in children.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Sneha", rating: 5, comment: "Very supportive" }],
    appointments: Array(8).fill({})
  },
  {
    _id: "3",
    name: "Dr. Ananya Iyer",
    specialization: "Child Psychologist",
    education: "MA Child Development",
    officeAddress: "56 Little Minds St, Bangalore",
    personalStatement: "Promoting emotional well-being in kids.",
    experience: 6,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 4, comment: "Great with kids" }],
    appointments: Array(12).fill({})
  },
  {
    _id: "4",
    name: "Dr. Vikram Singh",
    specialization: "Child Psychologist",
    education: "PhD Clinical Psychology",
    officeAddress: "78 Happy Child Rd, Bangalore",
    personalStatement: "Helping children overcome anxiety and stress.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Priya", rating: 5, comment: "Highly recommended" }],
    appointments: Array(10).fill({})
  },
  {
    _id: "5",
    name: "Dr. Kavita Menon",
    specialization: "Child Psychologist",
    education: "MA Child & Adolescent Psychology",
    officeAddress: "12 Growth Ave, Bangalore",
    personalStatement: "Supporting kids' mental and emotional health.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Amit", rating: 4, comment: "Very professional" }],
    appointments: Array(9).fill({})
  },
  {
    _id: "6",
    name: "Dr. Harish Rao",
    specialization: "Child Psychologist",
    education: "MD Psychiatry",
    officeAddress: "34 Joyful Kids St, Bangalore",
    personalStatement: "Empowering children through therapeutic techniques.",
    experience: 11,
    photo: "",
    reviews: [{ patient: "Sneha", rating: 5, comment: "Amazing with children" }],
    appointments: Array(14).fill({})
  },

  // =================== Psychotherapists ===================
  {
    _id: "10",
    name: "Dr. Anita Roy",
    specialization: "Psychotherapist",
    education: "MA Clinical Psychology",
    officeAddress: "23 Peace Ave, Bangalore",
    personalStatement: "Guiding adults to overcome anxiety and depression.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 5, comment: "Excellent therapist" }],
    appointments: Array(10).fill({})
  },
  {
    _id: "11",
    name: "Dr. Rajesh Verma",
    specialization: "Psychotherapist",
    education: "PhD Psychology",
    officeAddress: "12 Calm St, Bangalore",
    personalStatement: "Helping adults find mental clarity.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very understanding" }],
    appointments: Array(9).fill({})
  },
  {
    _id: "12",
    name: "Dr. Sunita Nair",
    specialization: "Psychotherapist",
    education: "MA Counseling",
    officeAddress: "45 Mindful Ln, Bangalore",
    personalStatement: "Focusing on personal growth and stress relief.",
    experience: 6,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 5, comment: "Great listener" }],
    appointments: Array(11).fill({})
  },
  {
    _id: "13",
    name: "Dr. Arjun Patil",
    specialization: "Psychotherapist",
    education: "MA Clinical Psychology",
    officeAddress: "67 Serenity Rd, Bangalore",
    personalStatement: "Supporting emotional well-being through therapy.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Anjali", rating: 4, comment: "Very patient" }],
    appointments: Array(12).fill({})
  },
  {
    _id: "14",
    name: "Dr. Rekha Sharma",
    specialization: "Psychotherapist",
    education: "PhD Clinical Psychology",
    officeAddress: "89 Tranquil St, Bangalore",
    personalStatement: "Helping clients manage anxiety and stress.",
    experience: 10,
    photo: "",
    reviews: [{ patient: "Priya", rating: 5, comment: "Highly effective" }],
    appointments: Array(13).fill({})
  },
  {
    _id: "15",
    name: "Dr. Vivek Joshi",
    specialization: "Psychotherapist",
    education: "MA Counseling Psychology",
    officeAddress: "34 Mind Lane, Bangalore",
    personalStatement: "Focusing on emotional healing and personal growth.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 4, comment: "Very helpful" }],
    appointments: Array(8).fill({})
  },

  // =================== Marriage & Family Therapists (MFT) ===================
  {
    _id: "20",
    name: "Dr. Sunil Menon",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "MA Counseling, Family Therapy Certification",
    officeAddress: "56 Harmony St, Bangalore",
    personalStatement: "Helping couples strengthen their relationships.",
    experience: 12,
    photo: "",
    reviews: [{ patient: "Priya", rating: 5, comment: "Very understanding" }],
    appointments: Array(20).fill({})
  },
  {
    _id: "21",
    name: "Dr. Nidhi Rao",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "PhD Family Therapy",
    officeAddress: "12 Union Rd, Bangalore",
    personalStatement: "Specializing in resolving family conflicts.",
    experience: 10,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 5, comment: "Highly effective" }],
    appointments: Array(15).fill({})
  },
  {
    _id: "22",
    name: "Dr. Ajay Kumar",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "MA Counseling Psychology",
    officeAddress: "23 Together St, Bangalore",
    personalStatement: "Helping families communicate better.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very helpful" }],
    appointments: Array(12).fill({})
  },
  {
    _id: "23",
    name: "Dr. Priya Nair",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "MA Family Therapy",
    officeAddress: "34 Bond St, Bangalore",
    personalStatement: "Supporting couples to build strong relationships.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Anjali", rating: 5, comment: "Excellent support" }],
    appointments: Array(18).fill({})
  },
  {
    _id: "24",
    name: "Dr. Rakesh Sharma",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "PhD Clinical Psychology",
    officeAddress: "45 Connect Rd, Bangalore",
    personalStatement: "Helping families overcome challenges together.",
    experience: 11,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 4, comment: "Very professional" }],
    appointments: Array(14).fill({})
  },
  {
    _id: "25",
    name: "Dr. Sneha Iyer",
    specialization: "Marriage and Family Therapist (MFT)",
    education: "MA Counseling Psychology",
    officeAddress: "67 Unity Ln, Bangalore",
    personalStatement: "Focused on family well-being and mental health.",
    experience: 10,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 5, comment: "Highly recommended" }],
    appointments: Array(16).fill({})
  },

  // =================== Cognitive Behavioral Therapists ===================
  {
    _id: "30",
    name: "Dr. Nisha Verma",
    specialization: "Cognitive Behavioral Therapist",
    education: "PhD CBT",
    officeAddress: "78 Mind Ave, Bangalore",
    personalStatement: "Specializing in CBT for anxiety and OCD.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Ravi", rating: 5, comment: "Highly effective" }],
    appointments: Array(14).fill({})
  },
  {
    _id: "31",
    name: "Dr. Prateek Jain",
    specialization: "Cognitive Behavioral Therapist",
    education: "MA Clinical Psychology",
    officeAddress: "12 Focus Rd, Bangalore",
    personalStatement: "Helping clients change negative thought patterns.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Anjali", rating: 4, comment: "Very helpful" }],
    appointments: Array(12).fill({})
  },
  {
    _id: "32",
    name: "Dr. Rekha Nair",
    specialization: "Cognitive Behavioral Therapist",
    education: "PhD CBT",
    officeAddress: "23 Clarity St, Bangalore",
    personalStatement: "Guiding clients through structured CBT sessions.",
    experience: 10,
    photo: "",
    reviews: [{ patient: "Priya", rating: 5, comment: "Excellent therapist" }],
    appointments: Array(16).fill({})
  },
  {
    _id: "33",
    name: "Dr. Arjun Verma",
    specialization: "Cognitive Behavioral Therapist",
    education: "MA Counseling",
    officeAddress: "34 Thought Ln, Bangalore",
    personalStatement: "Focused on behavior modification and emotional control.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 4, comment: "Very professional" }],
    appointments: Array(10).fill({})
  },
  {
    _id: "34",
    name: "Dr. Simran Sharma",
    specialization: "Cognitive Behavioral Therapist",
    education: "PhD Clinical Psychology",
    officeAddress: "45 Insight St, Bangalore",
    personalStatement: "Empowering clients to manage thoughts effectively.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 5, comment: "Highly recommended" }],
    appointments: Array(13).fill({})
  },
  {
    _id: "35",
    name: "Dr. Anil Kapoor",
    specialization: "Cognitive Behavioral Therapist",
    education: "MA CBT",
    officeAddress: "56 Mind St, Bangalore",
    personalStatement: "Specializing in CBT for depression and anxiety.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very effective" }],
    appointments: Array(11).fill({})
  },

  // =================== Occupational Therapists (Mental Health) ===================
  {
    _id: "40",
    name: "Dr. Anil Gupta",
    specialization: "Occupational Therapist (Mental Health)",
    education: "BSc OT, MSc Mental Health",
    officeAddress: "12 Therapy Lane, Bangalore",
    personalStatement: "Helping patients regain functional skills.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very helpful" }],
    appointments: Array(10).fill({})
  },
  {
    _id: "41",
    name: "Dr. Pooja Mehta",
    specialization: "Occupational Therapist (Mental Health)",
    education: "MSc OT",
    officeAddress: "23 Rehab St, Bangalore",
    personalStatement: "Supporting mental health through occupational therapy.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Ravi", rating: 5, comment: "Highly effective" }],
    appointments: Array(8).fill({})
  },
  {
    _id: "42",
    name: "Dr. Sameer Reddy",
    specialization: "Occupational Therapist (Mental Health)",
    education: "BSc OT",
    officeAddress: "34 Wellness Ln, Bangalore",
    personalStatement: "Focus on patient recovery and daily living skills.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Priya", rating: 4, comment: "Very helpful" }],
    appointments: Array(11).fill({})
  },
  {
    _id: "43",
    name: "Dr. Anjali Kapoor",
    specialization: "Occupational Therapist (Mental Health)",
    education: "MSc Mental Health OT",
    officeAddress: "45 Care St, Bangalore",
    personalStatement: "Helping patients improve quality of life.",
    experience: 8,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 5, comment: "Highly recommended" }],
    appointments: Array(10).fill({})
  },
  {
    _id: "44",
    name: "Dr. Rohit Sharma",
    specialization: "Occupational Therapist (Mental Health)",
    education: "BSc OT",
    officeAddress: "56 Recovery Ln, Bangalore",
    personalStatement: "Focused on mental and functional rehabilitation.",
    experience: 7,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very professional" }],
    appointments: Array(9).fill({})
  },
  {
    _id: "45",
    name: "Dr. Nisha Iyer",
    specialization: "Occupational Therapist (Mental Health)",
    education: "MSc OT",
    officeAddress: "67 Therapy Rd, Bangalore",
    personalStatement: "Helping patients regain independence.",
    experience: 9,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 5, comment: "Very effective" }],
    appointments: Array(12).fill({})
  },

  // =================== Psychoanalysts ===================
  {
    _id: "50",
    name: "Dr. Priya Sharma",
    specialization: "Psychoanalyst",
    education: "MA Psychoanalysis",
    officeAddress: "34 Insight Rd, Bangalore",
    personalStatement: "Exploring unconscious mind to help clients.",
    experience: 15,
    photo: "",
    reviews: [{ patient: "Amit", rating: 5, comment: "Deep insights" }],
    appointments: Array(25).fill({})
  },
  {
    _id: "51",
    name: "Dr. Ankit Verma",
    specialization: "Psychoanalyst",
    education: "PhD Psychoanalysis",
    officeAddress: "12 Mind St, Bangalore",
    personalStatement: "Helping individuals understand their inner thoughts.",
    experience: 12,
    photo: "",
    reviews: [{ patient: "Sneha", rating: 4, comment: "Very insightful" }],
    appointments: Array(15).fill({})
  },
  {
    _id: "52",
    name: "Dr. Simran Kapoor",
    specialization: "Psychoanalyst",
    education: "MA Clinical Psychology",
    officeAddress: "23 Soul Rd, Bangalore",
    personalStatement: "Helping clients explore unconscious patterns.",
    experience: 10,
    photo: "",
    reviews: [{ patient: "Rohit", rating: 5, comment: "Excellent guidance" }],
    appointments: Array(18).fill({})
  },
  {
    _id: "53",
    name: "Dr. Raghav Nair",
    specialization: "Psychoanalyst",
    education: "PhD Psychoanalysis",
    officeAddress: "34 Insight Lane, Bangalore",
    personalStatement: "Focused on understanding hidden emotions.",
    experience: 14,
    photo: "",
    reviews: [{ patient: "Kiran", rating: 5, comment: "Very helpful" }],
    appointments: Array(20).fill({})
  },
  {
    _id: "54",
    name: "Dr. Ananya Sharma",
    specialization: "Psychoanalyst",
    education: "MA Psychoanalysis",
    officeAddress: "45 Mind Rd, Bangalore",
    personalStatement: "Helping clients improve self-awareness.",
    experience: 11,
    photo: "",
    reviews: [{ patient: "Meena", rating: 4, comment: "Very professional" }],
    appointments: Array(16).fill({})
  },
  {
    _id: "55",
    name: "Dr. Vivek Kapoor",
    specialization: "Psychoanalyst",
    education: "PhD Psychoanalysis",
    officeAddress: "56 Soul St, Bangalore",
    personalStatement: "Exploring unconscious mind patterns.",
    experience: 13,
    photo: "",
    reviews: [{ patient: "Ravi", rating: 5, comment: "Highly recommended" }],
    appointments: Array(22).fill({})
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
