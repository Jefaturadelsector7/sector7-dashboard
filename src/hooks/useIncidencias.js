import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { useUserRole } from './useUserRole';

export const useIncidencias = () => {
  const { user, role, loading: roleLoading } = useUserRole();
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roleLoading || !role) {
      setLoading(false);
      return;
    }

    const fetchIncidencias = async () => {
      try {
        let q;

        if (role === 'admin') {
          q = query(collection(db, 'incidencias'), orderBy('fecha', 'desc'));
        } else if (role === 'supervisor' && user?.zonaId) {
          q = query(
            collection(db, 'incidencias'),
            where('zonaId', '==', user.zonaId),
            orderBy('fecha', 'desc')
          );
        } else if (role === 'director' && user?.escuelaId) {
          q = query(
            collection(db, 'incidencias'),
            where('escuelaId', '==', user.escuelaId),
            orderBy('fecha', 'desc')
          );
        } else {
          setIncidencias([]);
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setIncidencias(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setIncidencias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, [role, user, roleLoading]);

  const agregarIncidencia = async (datosIncidencia) => {
    try {
      await addDoc(collection(db, 'incidencias'), {
        ...datosIncidencia,
        fecha: new Date(),
        estado: 'pendiente',
      });
      // Recargar incidencias
      const q = role === 'admin' 
        ? query(collection(db, 'incidencias'), orderBy('fecha', 'desc'))
        : role === 'supervisor'
        ? query(collection(db, 'incidencias'), where('zonaId', '==', user.zonaId), orderBy('fecha', 'desc'))
        : query(collection(db, 'incidencias'), where('escuelaId', '==', user.escuelaId), orderBy('fecha', 'desc'));
      
      const querySnapshot = await getDocs(q);
      setIncidencias(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'incidencias', id), { estado: nuevoEstado });
      setIncidencias(prev =>
        prev.map(inc => inc.id === id ? { ...inc, estado: nuevoEstado } : inc)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const eliminarIncidencia = async (id) => {
    try {
      await deleteDoc(doc(db, 'incidencias', id));
      setIncidencias(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { incidencias, loading, error, agregarIncidencia, actualizarEstado, eliminarIncidencia };
};
