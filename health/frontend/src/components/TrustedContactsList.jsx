import React, { useState, useEffect } from 'react';
import { Phone, User, Edit, Trash, Star } from 'lucide-react';
import AddContactForm from './AddContactForm';
import './TrustedContactsList.css';

const API_BASE = 'http://localhost:5000/api';

const TrustedContactsList = ({ refreshTrigger = 0 }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [refreshTrigger]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      console.log('Fetching contacts...');
      const response = await fetch(`${API_BASE}/contacts?userId=default_user`);
      const data = await response.json();
      console.log('Contacts fetched:', data);

      if (data.success) {
        setContacts(data.data);
        setError('');
      } else {
        setError(data.message || 'Error fetching contacts');
      }
    } catch (err) {
      console.error('Network error in fetchContacts:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      console.log('Deleting contact ID:', id);
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log('Delete response:', data);

      if (data.success) {
        setContacts(contacts.filter((contact) => contact._id !== id));
        alert('Contact deleted successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Network error in delete:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      console.log('Setting primary contact ID:', id);
      const response = await fetch(`${API_BASE}/contacts/${id}/primary`, {
        method: 'PATCH',
      });
      const data = await response.json();
      console.log('Set primary response:', data);

      if (data.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === id
              ? { ...contact, isPrimary: true }
              : { ...contact, isPrimary: false }
          )
        );
        alert('Primary contact updated successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Network error in setting primary:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleEdit = (contact) => {
    console.log('Editing contact:', contact);
    setEditingContact(contact);
  };

  const handleContactUpdated = (updatedContact) => {
    console.log('Contact updated/added:', updatedContact);
    setContacts(
      contacts.map((contact) =>
        contact._id === updatedContact._id ? updatedContact : contact
      )
    );
    setEditingContact(null);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  return (
    <div className="trusted-contacts-list">
      <h3 className="list-title">📋 Trusted Contacts List</h3>

      {loading && <p className="loading">⏳ Loading contacts...</p>}
      {error && <p className="error-message">{error}</p>}

      {contacts.length === 0 && !loading && !error && (
        <p className="no-contacts">No trusted contacts found. Add one above!</p>
      )}

      {editingContact && (
        <AddContactForm
          editContact={editingContact}
          onContactAdded={handleContactUpdated}
          onCancel={handleCancelEdit}
        />
      )}

      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact._id} className="contact-card">
            <div className="contact-info">
              <p className="contact-name">
                <User size={16} /> {contact.name}
                {contact.isPrimary && <Star size={16} className="primary-star" />}
              </p>
              <p className="contact-phone">
                <Phone size={16} /> {contact.phone}
              </p>
              <p className="contact-relationship">
                <span>Relationship:</span> {contact.relationship}
              </p>
            </div>
            <div className="contact-actions">
              <button
                className="action-button edit-button"
                onClick={() => handleEdit(contact)}
                title="Edit contact"
              >
                <Edit size={16} />
              </button>
              <button
                className="action-button delete-button"
                onClick={() => handleDelete(contact._id)}
                title="Delete contact"
              >
                <Trash size={16} />
              </button>
              {!contact.isPrimary && (
                <button
                  className="action-button primary-button"
                  onClick={() => handleSetPrimary(contact._id)}
                  title="Set as primary"
                >
                  <Star size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedContactsList;
