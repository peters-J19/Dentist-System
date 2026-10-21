// New-patient intake form. Posts to the backend, then pushes the returned
// patient's minimal fields into the shared sidebar cache so it shows up
// immediately in search/lookups elsewhere without a full refetch.
import React, { useState } from 'react';
import './AddPatient.css';
import { FaUserPlus } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';

function AddPatient() {

  const { addPatientToCache } = useOutletContext();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    domicilio: '',
    zona: '',
    telefono: '',
    celular: '',
    profesion: '',
    fecha_nac: '',
    edad: '',
    notas_pac: ''
  });

  const [submitStatus, setSubmitStatus] = useState({ status: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-fill the read-only age field whenever the birth date changes.
    // Display-only — edad isn't sent to the backend (see handleSubmit).
    if (name === 'fecha_nac') {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const hasHadBirthday =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        edad: hasHadBirthday ? age : age - 1,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha_nac) {
      setSubmitStatus({ status: 'error', message: 'Fecha de nacimiento requerida' });
      setTimeout(() => setSubmitStatus({ status: '', message: '' }), 3000);
      return;
    }

    if (!formData.nombre.trim() && !formData.apellidos.trim()) {
      setSubmitStatus({ status: 'error', message: 'Informacion Insuficiente' });
      setTimeout(() => setSubmitStatus({ status: '', message: '' }), 3000);
      return;
    }

    setLoading(true);
    setSubmitStatus({ status: '', message: '' });

    try {
      // edad is display-only in this form — the backend derives age from
      // fecha_nac itself, so it's left out of what actually gets saved.
      const { edad, ...patientPayload } = formData;
      const response = await fetch('http://localhost:5000/add-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const newPatient = await response.json();

      // Only the fields the sidebar cache actually needs.
      const minimalPatient = {
        id_pac: newPatient.id_pac,
        nombre: newPatient.nombre,
        apellidos: newPatient.apellidos,
        celular: newPatient.celular,
        telefono: newPatient.telefono,
      };
      addPatientToCache(minimalPatient);

      setSubmitStatus({ status: 'success', message: 'Paciente añadido!' });
      setFormData({
        nombre: '',
        apellidos: '',
        domicilio: '',
        zona: '',
        telefono: '',
        celular: '',
        profesion: '',
        fecha_nac: '',
        edad: '',
        notas_pac: ''
      });
    } catch (error) {
      setSubmitStatus({ status: 'error', message: 'Error!' });
    } finally {
      setLoading(false);
      setTimeout(() => setSubmitStatus({ status: '', message: '' }), 3000);
    }
  };

  return (
    <div className="AddPatient">
      <FaUserPlus className="top-right-icon" />
      <div className="background-title">Añadir Nuevo Paciente</div>
      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="patient-form">
          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              maxLength={100}
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Apellidos
            <input
              type="text"
              name="apellidos"
              maxLength={100}
              value={formData.apellidos}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Domicilio
            <input
              type="text"
              name="domicilio"
              maxLength={200}
              value={formData.domicilio}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Zona
            <input
              type="text"
              name="zona"
              maxLength={100}
              value={formData.zona}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Teléfono
            <input
              type="text"
              name="telefono"
              maxLength={50}
              value={formData.telefono}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Celular
            <input
              type="text"
              name="celular"
              maxLength={50}
              value={formData.celular}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label className="profesion">
            Profesión
            <input
              className="profesion"
              type="text"
              maxLength={200}
              name="profesion"
              value={formData.profesion}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Fecha de Nacimiento
            <input
              type="date"
              name="fecha_nac"
              value={formData.fecha_nac}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <label>
            Edad
            <input type="number" name="edad" value={formData.edad} readOnly />
          </label>

          <label className="notas_pac">
            Notas del Paciente
            <textarea
              name="notas_pac"
              maxLength={500}
              value={formData.notas_pac}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className={`submit-btn ${submitStatus.status}`}
            disabled={loading}
          >
            {submitStatus.message || (loading ? 'Guardando...' : 'Guardar')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPatient;