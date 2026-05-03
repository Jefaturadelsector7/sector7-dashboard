import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function TableroIncidentes({ supervisiones, escuelas, filtroZona, filtroEscuela }) {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    zona: filtroZona || "",
    escuela: filtroEscuela || "",
    tipoIncidente: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  useEffect(() => {
    cargarIncidentes();
  }, []);

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "incidentes"), orderBy("fecha", "desc"));
      const snapshot = await getDocs(q);
      setIncidentes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error cargando incidentes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const incidentesFiltrados = incidentes.filter(incidente => {
    if (filtros.zona && incidente.zona !== filtros.zona) return false;
    if (filtros.escuela && incidente.escuela !== filtros.escuela) return false;
    if (filtros.tipoIncidente && incidente.tipoIncidente !== filtros.tipoIncidente) return false;
    return true;
  });

  const tiposIncidente = [...new Set(incidentes.map(i => i.tipoIncidente))];

  const getBadgeColor = (nivel) => {
    if (nivel === "alto") return "#fee2e2";
    if (nivel === "medio") return "#fef3c7";
    return "#dcfce7";
  };

  const getBadgeTextColor = (nivel) => {
    if (nivel === "alto") return "#991b1b";
    if (nivel === "medio") return "#92400e";
    return "#166534";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Cargando reportes...</div>;
  }

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
      <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Tablero de Incidentes</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        {!filtroZona && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "12px" }}>Zona</label>
            <select name="zona" value={filtros.zona} onChange={handleFiltroChange} style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", boxSizing: "border-box" }}>
              <option value="">Todas</option>
              {supervisiones.map(z => (
                <option key={z.id} value={z.zona}>{z.zona}</option>
              ))}
            </select>
          </div>
        )}

        {!filtroEscuela && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "12px" }}>Escuela</label>
            <select name="escuela" value={filtros.escuela} onChange={handleFiltroChange} style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", boxSizing: "border-box" }}>
              <option value="">Todas</option>
              {escuelas.map(e => (
                <option key={e.id} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "12px" }}>Tipo de Incidente</label>
          <select name="tipoIncidente" value={filtros.tipoIncidente} onChange={handleFiltroChange} style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", boxSizing: "border-box" }}>
            <option value="">Todos</option>
            {tiposIncidente.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Folio</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Fecha</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Zona</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Escuela</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Tipo</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Responsable</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Riesgo</th>
              <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Autoridad</th>
            </tr>
          </thead>
          <tbody>
            {incidentesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "#666" }}>No hay reportes</td>
              </tr>
            ) : (
              incidentesFiltrados.map(incidente => (
                <tr key={incidente.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{incidente.folio}</td>
                  <td style={{ padding: "10px" }}>{new Date(incidente.fecha.seconds * 1000).toLocaleDateString("es-MX")}</td>
                  <td style={{ padding: "10px" }}>{incidente.zona}</td>
                  <td style={{ padding: "10px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{incidente.escuela}</td>
                  <td style={{ padding: "10px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{incidente.tipoIncidente}</td>
                  <td style={{ padding: "10px" }}>{incidente.nombreResponsable}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ background: getBadgeColor(incidente.nivelRiesgo), color: getBadgeTextColor(incidente.nivelRiesgo), padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                      {incidente.nivelRiesgo}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>{incidente.notificadoAutoridad === "si" ? "✓" : "✗"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "15px", background: "#f3f4f6", borderRadius: "4px", fontSize: "12px" }}>
        <strong>Total de reportes:</strong> {incidentesFiltrados.length}
        {incidentesFiltrados.length > 0 && (
          <>
            <br/>
            <strong>Nivel de riesgo alto:</strong> {incidentesFiltrados.filter(i => i.nivelRiesgo === "alto").length}
            <br/>
            <strong>Autoridades notificadas:</strong> {incidentesFiltrados.filter(i => i.notificadoAutoridad === "si").length}
          </>
        )}
      </div>
    </div>
  );
}