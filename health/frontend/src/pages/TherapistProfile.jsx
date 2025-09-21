// TherapistProfile.jsx
import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TherapistProfile({ therapist, onClose, onBookAppointment }) {
  if (!therapist) return null;

  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  const avgRating = therapist.reviews?.length
    ? therapist.reviews.reduce((sum, r) => sum + r.rating, 0) / therapist.reviews.length
    : 0;

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setBookingStatus("Please select a date and time.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/professionals/book", {
        doctorId: therapist._id,
        slot: selectedSlot,
        patientId: "PATIENT123",
      });

      const appointment = {
        doctor: therapist.name,
        specialization: therapist.specialization,
        date: new Date(selectedSlot).toLocaleDateString(),
        time: new Date(selectedSlot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (onBookAppointment) onBookAppointment(appointment);

      setBookingStatus(`✅ Appointment booked successfully for ${selectedSlot}`);
      setSelectedSlot("");
    } catch (err) {
      setBookingStatus(err.response?.data?.message || "❌ Booking failed!");
    }
  };

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ overflowY: "auto" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{therapist.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Photo */}
              <div className="col-md-4 text-center mb-3">
                <img
                  src={therapist.photo || "https://via.placeholder.com/200"}
                  alt={therapist.name}
                  className="img-fluid rounded"
                />
              </div>

              {/* Details */}
              <div className="col-md-8">
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item"><strong>Specialization:</strong> {therapist.specialization}</li>
                  <li className="list-group-item"><strong>Education:</strong> {therapist.education}</li>
                  <li className="list-group-item"><strong>Office Address:</strong> {therapist.officeAddress}</li>
                  <li className="list-group-item"><strong>Experience:</strong> {therapist.experience} years</li>
                  <li className="list-group-item"><strong>Appointments:</strong> {therapist.appointments?.length || 0}</li>
                  <li className="list-group-item"><strong>Personal Statement:</strong> {therapist.personalStatement}</li>
                  <li className="list-group-item text-warning fw-bold">
                    ⭐ Average Rating: {avgRating.toFixed(1)} / 5 ({therapist.reviews?.length || 0} reviews)
                  </li>
                </ul>

                {/* Reviews */}
                <div className="mb-4">
                  <h6>Reviews:</h6>
                  {therapist.reviews && therapist.reviews.length > 0 ? (
                    therapist.reviews.map((r, idx) => (
                      <div key={idx} className="border p-2 mb-2 rounded">
                        <p className="mb-1 fw-semibold">{r.patient}</p>
                        <p className="mb-1 text-warning">⭐ {r.rating}</p>
                        <p className="mb-0">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No reviews yet.</p>
                  )}
                </div>

                {/* Booking */}
                <div>
                  <h6>Book an Appointment</h6>
                  <div className="mb-3">
                    <input
                      type="datetime-local"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <button
                    onClick={handleBookAppointment}
                    className="btn btn-success"
                  >
                    Book Appointment
                  </button>
                  {bookingStatus && <p className="mt-2">{bookingStatus}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
