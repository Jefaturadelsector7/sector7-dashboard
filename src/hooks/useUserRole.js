import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useUserRole = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setLoading(true);
        if (authUser) {
          const userDocRef = doc(db, 'users', authUser.email);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              email: authUser.email,
              ...userData,
            });
            setRole(userData.role || null);
            setError(null);
          } else {
            setError('Usuario no encontrado en Firestore');
            setUser(null);
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
          setError(null);
        }
      } catch (err) {
        setError(err.message);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, role, loading, error };
};
