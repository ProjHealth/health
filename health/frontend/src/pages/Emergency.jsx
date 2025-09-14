import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import AddContactForm from "../components/AddContactForm";
import TrustedContactsList from "../components/TrustedContactsList";
import "./Emergency.css";

const API_BASE = 'http://localhost:5000/api';

const Emergency = () => {
  const [showForm, setShowForm] = useState(false);
  const [contactsUpdatedTrigger, setContactsUpdatedTrigger] = useState(0);
  const [isSendingSos, setIsSendingSos] = useState(false);
  const [isCallingHelpline, setIsCallingHelpline] = useState(false); // **NEW**: State for helpline call

  const handleContactAdded = () => {
    setShowForm(false);
    setContactsUpdatedTrigger(prev => prev + 1);
  };
  
  // Function to handle the SOS API call with geolocation
  const handleSendSos = async () => {
    if (!window.confirm('Are you sure you want to send an SOS to all trusted contacts?')) return;
    
    setIsSendingSos(true);

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
        }
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(`${API_BASE}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', location: { latitude, longitude } })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ SOS message sent successfully with your location!');
      } else {
        alert(`🚨 Error: ${data.message || 'Could not send SOS.'}`);
      }
    } catch (error) {
      console.error('SOS fetch error:', error);
      alert(`🚨 Could not send SOS. ${error.message}`);
    } finally {
      setIsSendingSos(false);
    }
  };

  // **NEW**: Function to handle the Twilio call via the backend
  const handleHelplineCall = async () => {
    if (!window.confirm('This will place an automated call to the emergency helpline. Proceed?')) {
      return;
    }

    setIsCallingHelpline(true);
    try {
      const response = await fetch(`${API_BASE}/emergency/call-helpline`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ Automated call to helpline initiated successfully!');
      } else {
        alert(`🚨 Error: ${data.message || 'Could not initiate call.'}`);
      }
    } catch (error) {
      console.error('Helpline call fetch error:', error);
      alert('🚨 Network error. Could not initiate call.');
    } finally {
      setIsCallingHelpline(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="full-screen">
      <div className="emergency-container">
        <h2 className="heading">🚨 Emergency Actions</h2>

        <button 
          className="emergency-button call-button"
          onClick={handleHelplineCall}      // **CHANGED**
          disabled={isCallingHelpline}    // **CHANGED**
        >
          <Phone size={22} />
          {isCallingHelpline ? 'Calling Helpline...' : 'Call Emergency Helpline'}
        </button>

        <button 
          className="emergency-button sos-button"
          onClick={handleSendSos}
          disabled={isSendingSos}
        >
          <MessageCircle size={22} /> 
          {isSendingSos ? 'Sending SOS...' : 'Send SOS to Contacts'}
        </button>

        <h3 className="subheading">👤 Trusted Contacts</h3>
        <button 
          className="toggle-form-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "➕ Add Contact"}
        </button>

        {showForm && (
          <AddContactForm 
            onContactAdded={handleContactAdded}
            onCancel={handleCancel}
          />
        )}

        <TrustedContactsList refreshTrigger={contactsUpdatedTrigger} />
      </div>
    </div>
  );
};

export default Emergency;