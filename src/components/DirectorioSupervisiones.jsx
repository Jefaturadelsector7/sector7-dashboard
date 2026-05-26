import React, { useState } from "react";
import "../styles/DirectorioSupervisiones.css";

const DirectorioSupervisiones = () => {
  const [selectedZone, setSelectedZone] = useState(null);

  const supervisiones = [
    {
      id: 1,
      zona: "Zona 18",
      supervisor: "Mtro. Oliverio Cante Ramírez",
      escuelas: 8,
      docentes: 45,
      alumnos: 1250,
      color: "#2563eb",
      icon: "🎓"
    },
    {
      id: 2,
      zona: "Zona 61",
      supervisor: "Mtra. Guadalupe Valenzuela Duarte",
      escuelas: 9,
      docentes: 52,
      alumnos: 1420,
      color: "#dc2626",
      icon: "📚"
    },
    {
      id: 3,
      zona: "Zona 156",
      supervisor: "Tatyana Velázquez Arellano",
      escuelas: 7,
      docentes: 38,
      alumnos: 980,
      color: "#16a34a",
      icon: "🏫"
    },
    {
      id: 4,
      zona: "Zona 175",
      supervisor: "Mtro. Alejandro César Ríos Ochoa",
      escuelas: 10,
      docentes: 58,
      alumnos: 1580,
      color: "#f59e0b",
      icon: "✨"
    },
    {
      id: 5,
      zona: "Zona 189",
      supervisor: "Mtro. Rogelio Meza Campos",
      escuelas: 10,
      docentes: 61,
      alumnos: 1650,
      color: "#7c3aed",
      icon: "🌟"
    }
  ];

  return (
    <div className="directorio-container">
      <div className="directorio-header">
        <h1>📋 Directorio de Supervisiones</h1>
        <p>Sector 7 - Educación Primaria - Heroica Matamoros, Tamaulipas</p>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">5</span>
            <span className="stat-label">Supervisiones</span>
          </div>
          <div className="stat">
            <span className="stat-number">44</span>
            <span className="stat-label">Escuelas</span>
          </div>
          <div className="stat">
            <span className="stat-number">254</span>
            <span className="stat-label">Docentes</span>
          </div>
          <div className="stat">
            <span className="stat-number">6,880</span>
            <span className="stat-label">Alumnos</span>
          </div>
        </div>
      </div>

      <div className="directorio-grid">
        {supervisiones.map((supervision) => (
          <div
            key={supervision.id}
            className="supervision-card"
            style={{ "--card-color": supervision.color }}
            onClick={() => setSelectedZone(selectedZone === supervision.id ? null : supervision.id)}
          >
            <div className="card-header" style={{ backgroundColor: supervision.color }}>
              <span className="card-icon">{supervision.icon}</span>
              <h2>{supervision.zona}</h2>
            </div>

            <div className="card-content">
              <div className="supervisor-info">
                <p className="label">Supervisor/a</p>
                <p className="value">{supervision.supervisor}</p>
              </div>

              <div className="metrics">
                <div className="metric">
                  <span className="metric-icon">🏢</span>
                  <div>
                    <p className="metric-number">{supervision.escuelas}</p>
                    <p className="metric-label">Escuelas</p>
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-icon">👨‍🏫</span>
                  <div>
                    <p className="metric-number">{supervision.docentes}</p>
                    <p className="metric-label">Docentes</p>
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-icon">👨‍🎓</span>
                  <div>
                    <p className="metric-number">{supervision.alumnos}</p>
                    <p className="metric-label">Alumnos</p>
                  </div>
                </div>
              </div>

              {selectedZone === supervision.id && (
                <div className="card-expanded">
                  <div className="expand-button">→ Ver detalles</div>
                </div>
              )}
            </div>

            <div className="card-accent" style={{ backgroundColor: supervision.color }}></div>
          </div>
        ))}
      </div>

      <div className="directorio-footer">
        <p>✓ Sistema de Gestión Educativa - Sector 7</p>
      </div>
    </div>
  );
};

export default DirectorioSupervisiones;
