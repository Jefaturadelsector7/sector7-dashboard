import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";

const hardcodedUsers = {
  "rocio@sector7.edu.mx": { password: "Sector7@2025", role: "admin", name: "Rocío Elvira Reyes Montalvo", zona: null, escuela: null },
  "director@sector7.edu.mx": { password: "Director@2025", role: "director", name: "Director Escuela", zona: null, escuela: "Gral. Lauro Villar" }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("escuelas");
  const [escuelas, setEscuelas] = useState([]);
  const [supervisiones, setSupervisiones] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userZona, setUserZona] = useState(null);
  const [userEscuela, setUserEscuela] = useState(null);
  const [userName, setUserName] = useState("");
  const [showEscuelasForm, setShowEscuelasForm] = useState(false);
  const [showSupervisionesForm, setShowSupervisionesForm] = useState(false);
  const [showIncidenciasForm, setShowIncidenciasForm] = useState(false);
  const [escuelasForm, setEscuelasForm] = useState({ nombre: "", director: "", supervisionId: "", estudiantes: "", docentes: "" });
  const [supervisionesForm, setSupervisionesForm] = useState({ zona: "", supervisor: "" });
  const [incidenciasForm, setIncidenciasForm] = useState({ tipo: "", descripcion: "", escuela: "", estado: "abierto" });

  useEffect(() => {
    getDocs(query(collection(db, "supervisiones"), orderBy("zona"))).then((snapshot) => { setSupervisiones(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); }).catch(err => console.error("Error:", err));
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, "incidencias"), orderBy("fecha", "desc"))).then((snapshot) => { setIncidencias(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); }).catch(err => console.error("Error:", err));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userEmail = currentUser.email;
        if (hardcodedUsers[userEmail]) {
          const userData = hardcodedUsers[userEmail];
          setUserRole(userData.role);
          setUserZona(userData.zona);
          setUserEscuela(userData.escuela);
          setUserName(userData.name);
        } else {
          try {
            const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", userEmail)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              setUserRole(userData.role || "supervisor");
              setUserZona(userData.zona || userData.zoneId);
              setUserEscuela(userData.escuela || null);
              setUserName(userData.name || userData.nombre || userEmail);
            } else {
              setUserRole("supervisor");
              setUserName(userEmail);
            }
          } catch (err) {
            console.error("Error:", err);
            setUserRole("supervisor");
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserZona(null);
        setUserEscuela(null);
        setUserName("");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !userRole) return;
    let q;
    if (userRole === "admin") {
      q = query(collection(db, "escuelas"), orderBy("nombre"));
    } else if (userRole === "supervisor" && userZona) {
      q = query(collection(db, "escuelas"), where("nombreZona", "==", userZona), orderBy("nombre"));
    } else if (userRole === "director" && userEscuela) {
      q = query(collection(db, "escuelas"), where("nombre", "==", userEscuela));
    } else {
      return;
    }
    getDocs(q).then((snapshot) => { setEscuelas(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); }).catch(err => console.error("Error:", err));
  }, [user, userRole, userZona, userEscuela]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (hardcodedUsers[email] && hardcodedUsers[email].password === password) {
      signInWithEmailAndPassword(auth, email, password).catch(err => { setError("Error: " + err.message); });
      setEmail("");
      setPassword("");
    } else {
      try {
        const userQuery = await getDocs(query(collection(db, "users"), where("email", "==", email)));
        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data();
          if (userData.role === "supervisor" && password === "Supervisor@2025") {
            signInWithEmailAndPassword(auth, email, password).catch(err => { setError("Error: " + err.message); });
            setEmail("");
            setPassword("");
          } else {
            setError("Email o contraseña incorrectos");
          }
        } else {
          setError("Email o contraseña incorrectos");
        }
      } catch (err) {
        setError("Email o contraseña incorrectos");
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUserRole(null);
    setUserZona(null);
    setUserEscuela(null);
    setUserName("");
  };

  const handleIncidenciasChange = (e) => {
    const { name, value } = e.target;
    setIncidenciasForm(prev => ({ ...prev, [name]: value }));
  };

  const handleIncidenciasSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!incidenciasForm.tipo || !incidenciasForm.descripcion || !incidenciasForm.escuela) {
      setError("Todos los campos son obligatorios");
      return;
    }
    addDoc(collection(db, "incidencias"), {
      tipo: incidenciasForm.tipo,
      descripcion: incidenciasForm.descripcion,
      escuela: incidenciasForm.escuela,
      estado: incidenciasForm.estado,
      fecha: new Date(),
      reportadoPor: userName,
      zona: userZona
    }).then(() => {
      setIncidenciasForm({ tipo: "", descripcion: "", escuela: "", estado: "abierto" });
      setShowIncidenciasForm(false);
      getDocs(query(collection(db, "incidencias"), orderBy("fecha", "desc"))).then(snapshot => setIncidencias(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }).catch(err => { setError("Error: " + err.message); });
  };

  const cambiarEstadoIncidencia = (id, nuevoEstado) => {
    updateDoc(doc(db, "incidencias", id), { estado: nuevoEstado }).then(() => {
      getDocs(query(collection(db, "incidencias"), orderBy("fecha", "desc"))).then(snapshot => setIncidencias(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }).catch(err => { setError("Error: " + err.message); });
  };

  const eliminarIncidencia = (id) => {
    deleteDoc(doc(db, "incidencias", id)).then(() => {
      getDocs(query(collection(db, "incidencias"), orderBy("fecha", "desc"))).then(snapshot => setIncidencias(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }).catch(err => { setError("Error: " + err.message); });
  };

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Cargando...</div>;

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#1e40af" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "8px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <h1 style={{ color: "#1e40af", textAlign: "center", margin: "0 0 10px 0" }}>SECTOR 7</h1>
          <p style={{ color: "#666", textAlign: "center", margin: "0 0 30px 0" }}>Primarias H. Matamoros</p>
          {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "4px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required />
            <button type="submit" style={{ padding: "10px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Ingresar</button>
          </form>
          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
          <p style={{ fontSize: "11px", color: "#666" }}><strong>Admin:</strong> rocio@sector7.edu.mx / Sector7@2025</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <header style={{ background: "#1e40af", color: "white", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>SECTOR 7 - TABLERO DE MANDOS</h1>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ fontSize: "14px" }}>{userName} ({userRole})</span>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Salir</button>
        </div>
      </header>
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {userRole === "admin" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e5e7eb", flexWrap: "wrap" }}>
              <button onClick={() => setActiveTab("escuelas")} style={{ padding: "10px 20px", background: activeTab === "escuelas" ? "#2563eb" : "transparent", color: activeTab === "escuelas" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>Escuelas</button>
              <button onClick={() => setActiveTab("supervisiones")} style={{ padding: "10px 20px", background: activeTab === "supervisiones" ? "#2563eb" : "transparent", color: activeTab === "supervisiones" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>Supervisiones</button>
              <button onClick={() => setActiveTab("incidencias")} style={{ padding: "10px 20px", background: activeTab === "incidencias" ? "#2563eb" : "transparent", color: activeTab === "incidencias" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>Incidencias</button>
            </div>
            {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "4px", marginBottom: "20px" }}>{error}</div>}
            
            {activeTab === "incidencias" && (
              <div>
                <button onClick={() => setShowIncidenciasForm(!showIncidenciasForm)} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", marginBottom: "20px" }}>
                  {showIncidenciasForm ? "Cerrar" : "Reportar Incidencia"}
                </button>
                {showIncidenciasForm && (
                  <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Nueva Incidencia</h2>
                    <form onSubmit={handleIncidenciasSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <select name="tipo" value={incidenciasForm.tipo} onChange={handleIncidenciasChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required>
                        <option value="">-- Seleccionar Tipo --</option>
                        <option value="Falta de docente">Falta de docente</option>
                        <option value="Infraestructura">Infraestructura</option>
                        <option value="Disciplina">Disciplina</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <input type="text" name="escuela" placeholder="Escuela" value={incidenciasForm.escuela} onChange={handleIncidenciasChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required />
                      <textarea name="descripcion" placeholder="Descripción" value={incidenciasForm.descripcion} onChange={handleIncidenciasChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "100px" }} required />
                      <select name="estado" value={incidenciasForm.estado} onChange={handleIncidenciasChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                        <option value="abierto">Abierto</option>
                        <option value="en progreso">En progreso</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                      <button type="submit" style={{ padding: "10px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Guardar Incidencia</button>
                    </form>
                  </div>
                )}
                <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                  <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Incidencias ({incidencias.length})</h2>
                  {incidencias.length === 0 ? <p style={{ color: "#666" }}>No hay incidencias</p> : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead><tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Tipo</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Escuela</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Descripción</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Estado</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Reportado Por</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Acción</th>
                      </tr></thead>
                      <tbody>
                        {incidencias.map((inc) => (
                          <tr key={inc.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "12px" }}>{inc.tipo}</td>
                            <td style={{ padding: "12px" }}>{inc.escuela}</td>
                            <td style={{ padding: "12px" }}>{inc.descripcion?.substring(0, 30)}...</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ padding: "4px 8px", borderRadius: "4px", background: inc.estado === "abierto" ? "#fee2e2" : inc.estado === "en progreso" ? "#fef3c7" : "#dcfce7", color: inc.estado === "abierto" ? "#991b1b" : inc.estado === "en progreso" ? "#92400e" : "#15803d", fontSize: "12px" }}>
                                {inc.estado}
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>{inc.reportadoPor}</td>
                            <td style={{ padding: "12px" }}>
                              <button onClick={() => eliminarIncidencia(inc.id)} style={{ padding: "4px 8px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
