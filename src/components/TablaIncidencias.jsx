import { useIncidencias } from '../hooks/useIncidencias';

export const TablaIncidencias = () => {
  const { incidencias, loading, error, actualizarEstado, eliminarIncidencia } = useIncidencias();

  const estadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#fbbf24';
      case 'revisado': return '#60a5fa';
      case 'resuelto': return '#34d399';
      default: return '#9ca3af';
    }
  };

  if (loading) return <div>Cargando incidencias...</div>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2 style={{ color: '#1e40af', margin: '0 0 20px 0' }}>Fichas Informativas ({incidencias.length})</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {incidencias.length === 0 ? (
        <p style={{ color: '#666' }}>No hay fichas informativas</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Titulo</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Escuela</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Reportado por</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Accion</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map((inc) => (
              <tr key={inc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{inc.titulo}</td>
                <td style={{ padding: '12px' }}>{inc.tipo}</td>
                <td style={{ padding: '12px' }}>{inc.escuelaNombre}</td>
                <td style={{ padding: '12px' }}>{inc.reportadoPor}</td>
                <td style={{ padding: '12px' }}>{new Date(inc.fecha?.toDate?.() || inc.fecha).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={inc.estado}
                    onChange={(e) => actualizarEstado(inc.id, e.target.value)}
                    style={{ padding: '5px', background: estadoColor(inc.estado), color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisado">Revisado</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => eliminarIncidencia(inc.id)}
                    style={{ padding: '5px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
