import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import MapaInteractivo from "./components/MapaInteractivo";

const hardcodedUsers = {
  "rocio@sector7.edu.mx": { password: "Sector7@2025", role: "admin", name: "Rocío Elvira Reyes Montalvo" },
  "director@sector7.edu.mx": { password: "Director@2025", role: "director", name: "Director Escuela" }
};

const supervisiones_coords = [
  { zona: "Zona 189", nombre: "Esc. Tamaulipas", lat: 25.8768, lng: -97.4976, direccion: "Calle Tercera y Emiliano Zapata, Col. Ejido 20 de Noviembre" },
  { zona: "Zona 18", nombre: "Supervisión", lat: 25.8820, lng: -97.5010, direccion: "Calle Isaac Newton #125, Col. Nuevo Progreso" },
  { zona: "Zona 61", nombre: "Esc. Francisco I Madero", lat: 25.8750, lng: -97.5050, direccion: "Calle Cedro S/N, Col. Mariano" },
  { zona: "Zona 156", nombre: "Esc. Club Rotario Matamoros Sur", lat: 25.8700, lng: -97.4950, direccion: "Calle Presa de la Angostura #51, Col. Rodríguez" },
  { zona: "Zona 175", nombre: "Escuela México", lat: 25.8850, lng: -97.5100, direccion: "Calle Lomas e Insurgentes Sur, Col. México" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("escuelas");
  const [escuelas, setEscuelas] = useState([]);
  const [supervisiones, setSupervisiones] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userZona, setUserZona] = useState(null);
  const [userName, setUserName] = useState("");
  const [showEscuelasForm, setShowEscuelasForm] = useState(false);
  const [showSupervisionesForm, setShowSupervisionesForm] = useState(false);
  const [escuelasForm, setEscuelasForm] = useState({ nombre: "", director: "", supervisionId: "", estudiantes: "", docentes: "" });
  const [supervisionesForm, setSupervisionesForm] = useState({ zona: "", supervisor: "" });

  useEffect(() => {
    getDocs(query(collection(db, "supervisiones"), orderBy("zona"))).then((snapshot) => {
      setSupervisiones(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => console.error("Error:", err));
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
          setUserName(userData.name);
        } else {
          try {
            const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", userEmail)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              setUserRole(userData.role || "supervisor");
              setUserZona(userData.zona || userData.zoneId);
              setUserName(userData.name || userData.nombre || userEmail);
            }
          } catch (err) {
            setUserRole("supervisor");
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserZona(null);
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
    } else {
      return;
    }
    getDocs(q).then((snapshot) => {
      setEscuelas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => console.error("Error:", err));
  }, [user, userRole, userZona]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (hardcodedUsers[email] && hardcodedUsers[email].password === password) {
      signInWithEmailAndPassword(auth, email, password).catch(err => setError("Error: " + err.message));
      setEmail("");
      setPassword("");
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUserRole(null);
    setUserZona(null);
    setUserName("");
  };

  const handleEscuelasChange = (e) => {
    const { name, value } = e.target;
    setEscuelasForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSupervisionesChange = (e) => {
    const { name, value } = e.target;
    setSupervisionesForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEscuelasSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!escuelasForm.supervisionId) {
      setError("Debe seleccionar una zona");
      return;
    }
    const supervisionSeleccionada = supervisiones.find(s => s.id === escuelasForm.supervisionId);
    const { addDoc } = require("firebase/firestore");
    addDoc(collection(db, "escuelas"), {
      nombre: escuelasForm.nombre,
      director: escuelasForm.director,
      supervisionId: escuelasForm.supervisionId,
      nombreZona: supervisionSeleccionada.zona,
      supervisor: supervisionSeleccionada.supervisor,
      estudiantes: parseInt(escuelasForm.estudiantes),
      docentes: parseInt(escuelasForm.docentes),
      fecha: new Date()
    }).then(() => {
      setEscuelasForm({ nombre: "", director: "", supervisionId: "", estudiantes: "", docentes: "" });
      setShowEscuelasForm(false);
      getDocs(query(collection(db, "escuelas"), orderBy("nombre"))).then(snapshot => setEscuelas(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }).catch(err => setError("Error: " + err.message));
  };

  const handleSupervisionesSubmit = (e) => {
    e.preventDefault();
    setError("");
    const { addDoc } = require("firebase/firestore");
    addDoc(collection(db, "supervisiones"), {
      zona: supervisionesForm.zona,
      supervisor: supervisionesForm.supervisor,
      fecha: new Date()
    }).then(() => {
      setSupervisionesForm({ zona: "", supervisor: "" });
      setShowSupervisionesForm(false);
      getDocs(query(collection(db, "supervisiones"), orderBy("zona"))).then(snapshot => setSupervisiones(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }).catch(err => setError("Error: " + err.message));
  };

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Cargando...</div>;

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#1e40af" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "8px", width: "100%", maxWidth: "400px" }}>
          <h1 style={{ color: "#1e40af", textAlign: "center" }}>SECTOR 7</h1>
          <p style={{ color: "#666", textAlign: "center" }}>Primarias H. Matamoros</p>
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
          <span>{userName} ({userRole})</span>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Salir</button>
        </div>
      </header>
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {userRole === "admin" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e5e7eb", flexWrap: "wrap" }}>
              <button onClick={() => setActiveTab("escuelas")} style={{ padding: "10px 20px", background: activeTab === "escuelas" ? "#2563eb" : "transparent", color: activeTab === "escuelas" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>Escuelas</button>
              <button onClick={() => setActiveTab("mapa")} style={{ padding: "10px 20px", background: activeTab === "mapa" ? "#2563eb" : "transparent", color: activeTab === "mapa" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>📍 Mapa</button>
              <button onClick={() => setActiveTab("supervisiones")} style={{ padding: "10px 20px", background: activeTab === "supervisiones" ? "#2563eb" : "transparent", color: activeTab === "supervisiones" ? "white" : "#666", border: "none", cursor: "pointer", fontWeight: "600" }}>Supervisiones</button>
            </div>
            {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "4px", marginBottom: "20px" }}>{error}</div>}
            
            {activeTab === "mapa" && (
              <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                <MapaInteractivo supervisiones={supervisiones_coords} />
              </div>
            )}

            {activeTab === "supervisiones" && (
              <div>
                <button onClick={() => setShowSupervisionesForm(!showSupervisionesForm)} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", marginBottom: "20px" }}>
                  {showSupervisionesForm ? "Cerrar" : "Agregar Supervisión"}
                </button>
                {showSupervisionesForm && (
                  <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Nueva Supervisión</h2>
                    <form onSubmit={handleSupervisionesSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <input type="text" name="zona" placeholder="Nombre de la zona" value={supervisionesForm.zona} onChange={handleSupervisionesChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required />
                      <input type="text" name="supervisor" placeholder="Nombre del supervisor" value={supervisionesForm.supervisor} onChange={handleSupervisionesChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} required />
                      <button type="submit" style={{ padding: "10px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Guardar</button>
                    </form>
                  </div>
                )}
                <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
                  <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Supervisiones ({supervisiones.length})</h2>
                  {supervisiones.length === 0 ? <p>No hay supervisiones</p> : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead><tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Zona</th>
                        <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Supervisor</th>
                      </tr></thead>
                      <tbody>
                        {supervisiones.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "10px" }}>{s.zona}</td>
                            <td style={{ padding: "10px" }}>{s.supervisor}</td>
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

        {userRole === "supervisor" && (
          <div>
            <h2 style={{ color: "#1e40af", marginBottom: "20px" }}>Escuelas de {userZona}</h2>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
              {escuelas.length === 0 ? <p>No hay escuelas</p> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Escuela</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Director</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Estudiantes</th>
                    <th style={{ padding: "10px", textAlign: "left", fontWeight: "600" }}>Docentes</th>
                  </tr></thead>
                  <tbody>
                    {escuelas.map((e) => (
                      <tr key={e.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "10px" }}>{e.nombre}</td>
                        <td style={{ padding: "10px" }}>{e.director}</td>
                        <td style={{ padding: "10px" }}>{e.estudiantes}</td>
                        <td style={{ padding: "10px" }}>{e.docentes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



