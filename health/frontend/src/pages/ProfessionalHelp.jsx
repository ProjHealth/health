// ProfessionalHelpDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfessionalHelpDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reviewModalDoctor, setReviewModalDoctor] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Fetch doctors from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/professionals/recommended")
      .then(res => {
        setDoctors(res.data);
      })
      .catch(err => console.error("Error fetching doctors:", err));
  }, []);

  // Booking logic
  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    try {
      await axios.post("http://localhost:5000/api/professionals/book", {
        doctorId: selectedDoctor._id,
        slot: selectedSlot,
        patientId: "PATIENT123" // replace with actual logged-in user
      });

      alert(`Appointment booked with ${selectedDoctor.name} at ${selectedSlot}`);
      setSelectedDoctor(null);
      setSelectedSlot("");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed!");
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewModalDoctor || !reviewText) return;

    try {
      await axios.post(`http://localhost:5000/api/professionals/${reviewModalDoctor._id}/review`, {
        patientId: "PATIENT123",
        rating: reviewRating,
        comment: reviewText
      });

      alert(`Review submitted for ${reviewModalDoctor.name}`);
      setReviewModalDoctor(null);
      setReviewText("");
      setReviewRating(5);

      // Refresh doctors list to include new review
      const res = await axios.get("http://localhost:5000/api/professionals/recommended");
      setDoctors(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Review submission failed!");
    }
  };

  return (
    <div className="p-4 min-h-screen grid grid-cols-1 md:grid-cols-3 gap-4">
      {doctors.map(doc => (
        <div key={doc._id} className="p-4 shadow rounded-lg border">
          <h2 className="text-xl font-bold">{doc.name}</h2>
          <p>Specialization: {doc.specialization}</p>
          <p>Experience: {doc.experience} years</p>
          <p>
            Reviews: ⭐{" "}
            {doc.reviews?.length > 0
              ? (doc.reviews.reduce((a, r) => a + r.rating, 0) / doc.reviews.length).toFixed(1)
              : 0}/5
          </p>
          <button
            onClick={() => setSelectedDoctor(doc)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            Book Appointment
          </button>
          <button
            onClick={() => setReviewModalDoctor(doc)}
            className="mt-2 ml-2 px-3 py-1 bg-yellow-500 text-white rounded"
          >
            Add Review
          </button>
        </div>
      ))}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">
              Book Appointment with {selectedDoctor.name}
            </h2>

            <input
              type="datetime-local"
              value={selectedSlot}
              onChange={e => setSelectedSlot(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="px-3 py-1 bg-green-500 text-white rounded"
                disabled={!selectedSlot}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">
              Add Review for {reviewModalDoctor.name}
            </h2>

            <label className="block mb-2">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={reviewRating}
              onChange={e => setReviewRating(Number(e.target.value))}
              className="border p-2 w-full mb-4"
            />

            <label className="block mb-2">Comment</label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              className="border p-2 w-full mb-4"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewModalDoctor(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
                disabled={!reviewText}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
