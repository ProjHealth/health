import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfessionalHelp.css";
import TherapistProfile from "./TherapistProfile.jsx";

export default function ProfessionalHelpDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reviewModalDoctor, setReviewModalDoctor] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchQuery, setSearchQuery] = useState(""); // <-- Search state

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: 1, doctor: "Dr. Sarah Lee", specialization: "Child Psychologist", date: "2025-09-25", time: "10:30 AM" },
    { id: 2, doctor: "Dr. John Smith", specialization: "Psychotherapist", date: "2025-09-27", time: "2:00 PM" },
  ]);

  const [completedAppointments, setCompletedAppointments] = useState([
    { id: 101, doctor: "Dr. Emily Carter", specialization: "Clinical Psychologist", date: "2025-08-15", time: "9:00 AM" },
    { id: 102, doctor: "Dr. Raj Mehta", specialization: "Psychiatrist", date: "2025-08-20", time: "3:30 PM" },
  ]);

  const [bookAgainDoctor, setBookAgainDoctor] = useState(null);
  const [bookAgainDate, setBookAgainDate] = useState("");
  const [bookAgainTime, setBookAgainTime] = useState("10:00");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/professionals/recommended")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Error fetching doctors:", err));
  }, []);

  const groupedDoctors = doctors.reduce((acc, doc) => {
    const avgRating = doc.reviews?.length
      ? doc.reviews.reduce((a, r) => a + r.rating, 0) / doc.reviews.length
      : 0;
    doc.avgRating = avgRating;

    if (!acc[doc.specialization]) acc[doc.specialization] = [];
    acc[doc.specialization].push(doc);
    return acc;
  }, {});

  Object.keys(groupedDoctors).forEach((spec) => {
    groupedDoctors[spec].sort((a, b) => b.avgRating - a.avgRating);
  });

  const specializations = Object.keys(groupedDoctors);

  const handleSubmitReview = async () => {
    if (!reviewModalDoctor || !reviewText) return;
    try {
      await axios.post(
        `http://localhost:5000/api/professionals/${reviewModalDoctor._id}/review`,
        { patientId: "PATIENT123", rating: reviewRating, comment: reviewText }
      );
      alert(`Review submitted for ${reviewModalDoctor.name}`);
      setReviewModalDoctor(null);
      setReviewText("");
      setReviewRating(5);
      const res = await axios.get("http://localhost:5000/api/professionals/recommended");
      setDoctors(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Review submission failed!");
    }
  };

  const handleBookFromProfile = (appt) => {
    const conflict = upcomingAppointments.some(
      (a) => a.doctor === appt.doctor && a.date === appt.date && a.time === appt.time
    );
    if (conflict) return alert(`You already have an appointment with ${appt.doctor} at this time.`);
    setUpcomingAppointments((prev) => [...prev, { id: prev.length + 1, ...appt }]);
  };

  const handleBookAppointment = (doctor) => {
    const newAppt = { id: upcomingAppointments.length + 1, doctor: doctor.name, specialization: doctor.specialization, date: "2025-10-01", time: "11:00 AM" };
    const conflict = upcomingAppointments.some(
      (a) => a.doctor === doctor.name && a.date === newAppt.date && a.time === newAppt.time
    );
    if (conflict) return alert(`You already have an appointment with ${doctor.name} at this time.`);
    setUpcomingAppointments([...upcomingAppointments, newAppt]);
    alert(`Appointment booked with ${doctor.name}`);
  };

  const handleCancelAppointment = (id) => {
    setUpcomingAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  const handleBookAgain = (appt) => {
    setBookAgainDoctor(appt);
    setBookAgainDate(appt.date); // prefill with previous date
    setBookAgainTime(appt.time); // prefill with previous time
  };

  const handleConfirmBookAgain = () => {
    if (!bookAgainDoctor || !bookAgainDate || !bookAgainTime) return;

    const conflict = upcomingAppointments.some(
      (a) => a.doctor === bookAgainDoctor.doctor && a.date === bookAgainDate && a.time === bookAgainTime
    );
    if (conflict) return alert(`You already have an appointment with ${bookAgainDoctor.doctor} at this time.`);

    const newAppt = { id: upcomingAppointments.length + 1, doctor: bookAgainDoctor.doctor, specialization: bookAgainDoctor.specialization, date: bookAgainDate, time: bookAgainTime };
    setUpcomingAppointments([...upcomingAppointments, newAppt]);
    alert(`Booked again with ${bookAgainDoctor.doctor} on ${bookAgainDate} at ${bookAgainTime}`);
    setBookAgainDoctor(null);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container my-4">
      {!selectedDoctor && <h1 className="mb-4 text-center">PROFESSIONAL HELP</h1>}

      {selectedDoctor ? (
        <TherapistProfile therapist={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBookAppointment={handleBookFromProfile} />
      ) : (
        <>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "doctors" ? "active" : ""}`} onClick={() => { setActiveTab("doctors"); setSelectedSpecialization(""); }}>View Doctors</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "upcoming" ? "active" : ""}`} onClick={() => setActiveTab("upcoming")}>Upcoming Appointments</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "bookagain" ? "active" : ""}`} onClick={() => setActiveTab("bookagain")}>Book Again</button>
            </li>
            <li className="ms-auto d-flex">
              {/* Dropdown */}
              <select
                className="form-select me-2"
                style={{ width: "200px" }}
                value={selectedSpecialization}
                onChange={(e) => { setActiveTab("doctors"); setSelectedSpecialization(e.target.value); }}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (<option key={spec} value={spec}>{spec}</option>))}
              </select>

              {/* Search Bar */}
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                style={{ width: "250px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </li>
          </ul>

          {activeTab === "doctors" && Object.keys(groupedDoctors)
            .filter(spec => (!selectedSpecialization || selectedSpecialization === spec))
            .map(spec => {
              const filteredDocs = groupedDoctors[spec].filter(doc =>
                !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (filteredDocs.length === 0) return null;
              return (
                <div key={spec} className="mb-4">
                  <h4>{spec}</h4>
                  <div className="row">
                    {filteredDocs.map(doc => (
                      <div key={doc._id} className="col-md-4 mb-3">
                        <div className="card h-100">
                          {doc.photo ? <img src={doc.photo} className="card-img-top" alt={doc.name} /> : <div className="card-img-top d-flex align-items-center justify-content-center bg-secondary text-white" style={{height:'200px'}}>{doc.name.split(" ").map(n=>n[0]).join("")}</div>}
                          <div className="card-body">
                            <h5 className="card-title">{doc.name}</h5>
                            <p className="card-text">Experience: {doc.experience} years</p>
                            <p className="card-text">⭐ {doc.avgRating.toFixed(1)}/5</p>
                            <button className="btn btn-primary me-2" onClick={(e) => { e.stopPropagation(); setSelectedDoctor(doc); }}>View Profile</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          }

          {/* Upcoming & Book Again sections remain unchanged */}
          {activeTab === "upcoming" && (
            <div>
              <h4>Upcoming Appointments</h4>
              {upcomingAppointments.length === 0 && <p>No upcoming appointments.</p>}
              {upcomingAppointments.map(app => (
                <div key={app.id} className="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h5>{app.doctor}</h5>
                    <p>{app.specialization}</p>
                    <p>{app.date} at {app.time}</p>
                  </div>
                  <button className="btn btn-danger" onClick={() => handleCancelAppointment(app.id)}>Cancel</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "bookagain" && (
            <div>
              <h4>Completed Appointments</h4>
              {completedAppointments.length === 0 && <p>No completed appointments yet.</p>}
              {completedAppointments.map(app => (
                <div key={app.id} className="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center">
                  <div>
                    <h5>{app.doctor}</h5>
                    <p>{app.specialization}</p>
                    <p>{app.date} at {app.time}</p>
                  </div>
                  <div>
                    <button className="btn btn-success me-2" onClick={() => handleBookAgain(app)}>Book Again</button>
                    <button className="btn btn-secondary" onClick={() => setReviewModalDoctor({ name: app.doctor })}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewModalDoctor && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Review for {reviewModalDoctor.name}</h5>
                <button type="button" className="btn-close" onClick={() => setReviewModalDoctor(null)}></button>
              </div>
              <div className="modal-body">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="form-control mb-2" />
                <label>Comment</label>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="form-control" rows={3}></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReviewModalDoctor(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmitReview} disabled={!reviewText}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Again Modal */}
      {bookAgainDoctor && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Book Again: {bookAgainDoctor.doctor}</h5>
                <button type="button" className="btn-close" onClick={() => setBookAgainDoctor(null)}></button>
              </div>
              <div className="modal-body">
                <label>Select Date</label>
                <input type="date" value={bookAgainDate} min={today} onChange={(e) => setBookAgainDate(e.target.value)} className="form-control mb-2" />
                <label>Select Time</label>
                <input type="time" value={bookAgainTime} onChange={(e) => setBookAgainTime(e.target.value)} className="form-control" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setBookAgainDoctor(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmBookAgain} disabled={!bookAgainDate || !bookAgainTime}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
