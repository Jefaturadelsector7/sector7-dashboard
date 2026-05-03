import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useUserRole } from './useUserRole';

export const useEscuelas = () => {
  const { user, role, loading: roleLoading } = useUserRole();
  const [escuelas, setEscuelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roleLoading || !role) {
      setLoading(false);
      return;
    }

    const fetchEscuelas = async () => {
      try {
        let q;

        if (role === 'admin') {
          q = query(collection(db, 'escuelas'));
        } else if (role === 'supervisor' && user?.zonaId) {
          q = query(
            collection(db, 'escuelas'),
            where('zonaId', '==', user.zonaId)
          );
        } else if (role === 'director' && user?.escuelaId) {
          q = query(
            collection(db, 'escuelas'),
            where('id', '==', user.escuelaId)
          );
        } else {
          setEscuelas([]);
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEscuelas(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setEscuelas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEscuelas();
  }, [role, user, roleLoading]);

  return { escuelas, loading, error };
};
