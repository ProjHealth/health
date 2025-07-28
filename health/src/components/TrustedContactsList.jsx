import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";

const TrustedContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const contactsRef = collection(db, "users", user.uid, "trusted_contacts");
        const contactsSnapshot = await getDocs(contactsRef);
        const contactsData = contactsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(contactsData);
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [user]);

  return (
    <div className="mt-4">
      {contacts.length === 0 ? (
        <p>No trusted contacts added.</p>
      ) : (
        <ul className="list-none">
          {contacts.map(contact => (
            <li key={contact.id} className="p-2 flex items-center gap-2 border-b">
              <User size={20} className="text-blue-500" />
              {contact.name} - {contact.phone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrustedContactsList;

