import { useState } from "react";
import { Phone, MessageCircle, User } from "lucide-react";
import AddContactForm from "../components/AddContactForm";
import TrustedContactsList from "../components/TrustedContactsList";
import "./Emergency.css"; // ✅ Import the CSS file

const Emergency = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="full-screen">
      <div className="emergency-container">
        <h2 className="heading">🚨 Emergency Actions</h2>

        {/* Call Emergency Helpline */}
        <button 
          className="emergency-button call-button"
          onClick={() => window.location.href = "tel:9705112788"}
        >
          <Phone size={22} /> Call Emergency Helpline
        </button>

        {/* Send SOS Message */}
        <button 
          className="emergency-button sos-button"
          onClick={() => alert("🚨 SOS Message Sent!")}
        >
          <MessageCircle size={22} /> Send SOS

        </button>

        {/* Manage Trusted Contacts */}
        <h3 className="subheading">👤 Trusted Contacts</h3>
        <button 
          className="toggle-form-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "➕ Add Contact"}
        </button>

        {showForm && <AddContactForm />}
        <TrustedContactsList />
      </div>
    </div>
  );
};

export default Emergency;
