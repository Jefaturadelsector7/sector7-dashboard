import { useState } from 'react';
import { useIncidencias } from '../hooks/useIncidencias';
import { useUserRole } from '../hooks/useUserRole';

export const FormularioIncidencias = ({ escuelas, onClose }) => {
  const { agregarIncidencia } = useIncidencias();
  const { user, role } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    tipo: '',
    descripcion: '',
    escuelaId: '',
    escuelaNombre: '',
    zonaId: '',
    reportadoPor: user?.name || user?.email || '',
    rolReportante: role,
    archivoUrl: ''
  });

  const tipos = ['enfermedad', 'accidente', 'indisciplina', 'robo', 'nota en redes sociales', 'otro'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'escuelaId') {
      const escuelaSeleccionada = escuelas.find(e => e.id === value);
      setForm(prev => ({
        ...prev,
        escuelaId: value,
        escuelaNombre: escuelaSeleccionada?.nombre || '',
        zonaId: escuelaSeleccionada?.nombreZona || ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, archivoUrl: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.titulo || !form.tipo || !form.descripcion || !form.escuelaId) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      await agregarIncidencia({
        titulo: form.titulo,
        tipo: form.tipo,
        descripcion: form.descripcion,
        escuelaId: form.escuelaId,
        escuelaNombre: form.escuelaNombre,
        zonaId: form.zonaId,
        reportadoPor: form.reportadoPor,
        rolReportante: form.rolReportante,
        archivoUrl: form.archivoUrl
      });
      
      setForm({
        titulo: '',
        tipo: '',
        descripcion: '',
        escuelaId: '',
        escuelaNombre: '',
        zonaId: '',
        reportadoPor: user?.name || user?.email || '',
        rolReportante: role,
        archivoUrl: ''
      });
      
      onClose();
    } catch (err) {
      setError('Error al guardar incidencia: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h2 style={{ color: '#1e40af', margin: '0 0 20px 0' }}>Nueva Ficha Informativa</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          name="titulo"
          placeholder="Titulo"
          value={form.titulo}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          required
        />

        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          required
        >
          <option value="">-- Seleccionar Tipo --</option>
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <select
          name="escuelaId"
          value={form.escuelaId}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          required
        >
          <option value="">-- Seleccionar Escuela --</option>
          {escuelas.map(escuela => (
            <option key={escuela.id} value={escuela.id}>{escuela.nombre}</option>
          ))}
        </select>

        <textarea
          name="descripcion"
          placeholder="Descripcion"
          value={form.descripcion}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
          required
        />

        <input
          type="file"
          name="archivo"
          onChange={handleFileChange}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          accept="image/*,.pdf,.doc,.docx"
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            {loading ? 'Guardando...' : 'Guardar Ficha'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
