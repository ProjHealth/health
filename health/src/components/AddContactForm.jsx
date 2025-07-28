import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const AddContactForm = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("❌ Please fill in all fields");
      return;
    }

    try {
      const contactsRef = collection(db, "users", user.uid, "trusted_contacts");
      await addDoc(contactsRef, { name, phone, createdAt: new Date() });

      alert("✅ Contact Added Successfully!");
      setName("");
      setPhone("");
    } catch (error) {
      console.error("❌ Error adding contact:", error);
      alert("Failed to add contact");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold">Add Trusted Contact</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input 
          type="text" 
          placeholder="Contact Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input 
          type="text" 
          placeholder="Phone Number" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button 
          type="submit"
          className="bg-green-500 text-white p-2 rounded-md"
        >
          Add Contact
        </button>
      </form>
    </div>
  );
};

export default AddContactForm;
