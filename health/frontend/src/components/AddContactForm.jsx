import React, { useState, useEffect } from 'react';
import { User, Phone, Users } from 'lucide-react';
import './AddContactForm.css';

const AddContactForm = ({ editContact, onContactAdded, onCancel }) => {
  const initialFormState = {
    name: '',
    phone: '',
    relationship: 'Family',
    isPrimary: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localUser = JSON.parse(localStorage.getItem("user"));
  if (!localUser) throw new Error("User not found in localStorage");
  const userId = localUser.id;

  useEffect(() => {
    if (editContact) {
      setFormData({
        name: editContact.name || '',
        phone: editContact.phone || '',
        relationship: editContact.relationship || 'Family',
        isPrimary: editContact.isPrimary || false
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editContact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = editContact 
      ? `http://localhost:5000/api/contacts/${editContact._id}`
      : 'http://localhost:5000/api/contacts';
    
    try {
      const response = await fetch(url, {
        method: editContact ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: userId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(editContact ? 'Contact updated successfully!' : 'Contact added successfully!');
        if (typeof onContactAdded === 'function') {
          onContactAdded(data.data);
        }
      } else {
        const errorMsg = data.errors ? data.errors.join(', ') : data.message;
        alert(`Error: ${errorMsg || 'An unknown error occurred.'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Network or server error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="add-contact-form">
      <h3 className="form-title">{editContact ? '✏️ Edit Contact' : '➕ Add New Contact'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name"><User size={16} /> Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Jane Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone"><Phone size={16} /> Phone Number (with country code)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="e.g., +14155552671"
          />
        </div>

        <div className="form-group">
          <label htmlFor="relationship"><Users size={16} /> Relationship</label>
          <select
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            required
          >
            <option value="Family">Family</option>
            <option value="Friend">Friend</option>
            <option value="Colleague">Colleague</option>
            <option value="Doctor">Doctor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleChange}
            />
            Set as Primary Contact
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editContact ? 'Update Contact' : 'Add Contact')}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContactForm;