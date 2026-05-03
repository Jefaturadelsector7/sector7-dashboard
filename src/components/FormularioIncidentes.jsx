import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function FormularioIncidentes({ supervisiones, escuelas, zonaActual, escuelaActual }) {
  const [form, setForm] = useState({
    zona: zonaActual || "",
    escuela: escuelaActual || "",
    quienReporta: "Director",
    nombreResponsable: "",
    tipoIncidente: "Violencia escolar",
    otroTipo: "",
    descripcion: "",
    nivelRiesgo: "bajo",
    notificadoAutoridad: "no",
    observaciones: ""
  });

  const [imagenes, setImagenes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const tiposIncidente = [
    "Violencia escolar",
    "Accidente",
    "Situación de salud",
    "Problema con padres de familia",
    "Riesgo externo (seguridad)",
    "Daños a infraestructura",
    "Situación mediática (redes/noticias)",
    "Otro"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagenes.length > 3) {
      setError("Máximo 3 imágenes permitidas");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagenes(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const generarFolio = () => {
    return "INC-" + Date.now();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setEnviando(true);

    try {
      const folio = generarFolio();
      const ahora = new Date();
      const escuelaSeleccionada = escuelas.find(e => e.id === form.escuela);
      const zonaSeleccionada = supervisiones.find(z => z.id === form.zona);

      const reporte = {
        folio,
        zona: zonaSeleccionada?.zona || "",
        escuela: escuelaSeleccionada?.nombre || "",
        quienReporta: form.quienReporta,
        nombreResponsable: form.nombreResponsable,
        fecha: ahora,
        tipoIncidente: form.tipoIncidente === "Otro" ? form.otroTipo : form.tipoIncidente,
        descripcion: form.descripcion,
        nivelRiesgo: form.nivelRiesgo,
        notificadoAutoridad: form.notificadoAutoridad,
        observaciones: form.observaciones,
        cantidadImagenes: imagenes.length,
        creado: ahora.toLocaleString("es-MX")
      };

      await addDoc(collection(db, "incidentes"), reporte);

      setExito(`✅ Incidente reportado con éxito. Folio: ${folio}`);
      setForm({
        zona: zonaActual || "",
        escuela: escuelaActual || "",
        quienReporta: "Director",
        nombreResponsable: "",
        tipoIncidente: "Violencia escolar",
        otroTipo: "",
        descripcion: "",
        nivelRiesgo: "bajo",
        notificadoAutoridad: "no",
        observaciones: ""
      });
      setImagenes([]);

      setTimeout(() => {
        generarPDF(folio, reporte);
      }, 500);

    } catch (err) {
      setError("Error al guardar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  const generarPDF = (folio, reporte) => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("FICHA DE INCIDENTE", 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Folio: ${folio}`, 20, 35);
    doc.text(`Fecha: ${reporte.creado}`, 20, 45);
    doc.text(`Zona: ${reporte.zona}`, 20, 55);
    doc.text(`Escuela: ${reporte.escuela}`, 20, 65);
    doc.text(`Reporta: ${reporte.quienReporta}`, 20, 75);
    doc.text(`Responsable: ${reporte.nombreResponsable}`, 20, 85);
    doc.text(`Tipo de Incidente: ${reporte.tipoIncidente}`, 20, 95);
    doc.text(`Nivel de Riesgo: ${reporte.nivelRiesgo}`, 20, 105);
    doc.text(`Autoridad Notificada: ${reporte.notificadoAutoridad}`, 20, 115);
    
    doc.setFontSize(10);
    doc.text("Descripción:", 20, 130);
    const descripcionTexto = doc.splitTextToSize(reporte.descripcion, 170);
    doc.text(descripcionTexto, 20, 140);
    
    doc.save(`Incidente_${folio}.pdf`);
  };

  const escuelasDisponibles = zonaActual 
    ? escuelas.filter(e => e.nombreZona === zonaActual)
    : escuelas;

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px", maxWidth: "600px" }}>
      <h2 style={{ color: "#1e40af", margin: "0 0 20px 0" }}>Reportar Incidente</h2>

      {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "4px", marginBottom: "20px" }}>{error}</div>}
      {exito && <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "4px", marginBottom: "20px" }}>{exito}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {!zonaActual && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Zona Escolar *</label>
            <select name="zona" value={form.zona} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
              <option value="">-- Seleccionar --</option>
              {supervisiones.map(z => (
                <option key={z.id} value={z.id}>{z.zona}</option>
              ))}
            </select>
          </div>
        )}

        {!escuelaActual && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Escuela *</label>
            <select name="escuela" value={form.escuela} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
              <option value="">-- Seleccionar --</option>
              {escuelasDisponibles.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>¿Quién reporta? *</label>
          <select name="quienReporta" value={form.quienReporta} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
            <option value="Director">Director</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Nombre del Responsable *</label>
          <input type="text" name="nombreResponsable" value={form.nombreResponsable} onChange={handleChange} placeholder="Nombre completo" style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Tipo de Incidente *</label>
          <select name="tipoIncidente" value={form.tipoIncidente} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
            {tiposIncidente.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {form.tipoIncidente === "Otro" && (
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Especificar otro tipo *</label>
            <input type="text" name="otroTipo" value={form.otroTipo} onChange={handleChange} placeholder="Describa el tipo de incidente" style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required={form.tipoIncidente === "Otro"} />
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Descripción del Incidente *</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Máximo 500 caracteres" maxLength="500" style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box", minHeight: "100px", resize: "vertical" }} required />
          <small style={{ color: "#666" }}>{form.descripcion.length}/500</small>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Nivel de Riesgo *</label>
          <select name="nivelRiesgo" value={form.nivelRiesgo} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
            <option value="bajo">Bajo</option>
            <option value="medio">Medio</option>
            <option value="alto">Alto</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>¿Se notificó a alguna autoridad? *</label>
          <select name="notificadoAutoridad" value={form.notificadoAutoridad} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} required>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Observaciones Adicionales</label>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Información adicional" style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box", minHeight: "80px", resize: "vertical" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Evidencia Fotográfica (máximo 3 imágenes)</label>
          <input type="file" multiple accept="image/jpeg,image/png" onChange={handleImagenes} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }} />
          <small style={{ color: "#666" }}>{imagenes.length}/3 imágenes</small>
        </div>

        {imagenes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {imagenes.map((img, idx) => (
              <img key={idx} src={img} alt={`Evidencia ${idx + 1}`} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "4px" }} />
            ))}
          </div>
        )}

        <button 
          type="submit" 
          disabled={enviando}
          style={{ padding: "12px", background: enviando ? "#9ca3af" : "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: enviando ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "16px" }}
        >
          {enviando ? "Enviando..." : "Enviar Reporte"}
        </button>
      </form>
    </div>
  );
}