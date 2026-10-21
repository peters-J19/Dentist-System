// Ficha Clinica page (component/directory named ClinicalHistory; the UI
// label stays "Ficha Clinica".
// Search bar, the Fila 1 / Fila 2 patient-info fields, Notas del Paciente,
// Cobros Totales / Saldo, and the odontograma's Observaciones textarea are
// fully wired up (patient cache filtering, full-record fetch on selection,
// editable fields pre-filled from that record); no save/submit yet. Cobros
// Totales and Saldo are read-only, same as Visitas — their values are
// calculated from Citas data, not editable here. Observaciones is local
// state only for now — there's no odontogramas table/route yet, so it
// isn't populated or cleared on patient search. The odontograma drawing
// itself is still a labeled placeholder box, and the bottom
// Guardar/Cancelar buttons are visual-only with no click handlers yet.
import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import './ClinicalHistory.css';

// Age in whole years as of today, accounting for whether the birthday has
// happened yet this year. There's no "edad" column in the database — age is
// always derived from fecha_nac, whether that date just came from the picker
// or from a fetched patient record, so it never goes stale.
function calculateAge(fechaNac) {
  if (!fechaNac) return '';

  const birthDate = new Date(fechaNac);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  const computedAge = hasHadBirthday ? age : age - 1;

  return computedAge < 0 ? '' : computedAge;
}

// Formats a monetary value as "$123" or "- $123" for negatives (no "-" for
// zero/positive).
function formatCurrency(num) {
  if (num == null || isNaN(num)) return '---';
  return num < 0 ? `- $${Math.abs(num)}` : `$${num}`;
}

// Saldo is green at 0 (nothing owed) or positive (patient has a credit for
// a future appointment), red when negative (patient owes money) — a "tab"
// she can track. Cobros Totales has no such logic: it's a monotonically
// increasing lifetime total that should never go negative, so it always
// displays in the default gray.
function getSaldoColorClass(num) {
  if (num == null || isNaN(num)) return '';
  return num < 0 ? 'red-text' : 'green-text';
}

// Fila 1 / Fila 2 fields — blank shape shared by initial state, a cleared
// selection, and a failed fetch.
const EMPTY_FICHA_FORM = {
  nombre: '',
  apellidos: '',
  fecha_nac: '',
  edad: '',
  celular: '',
  telefono: '',
  domicilio: '',
  zona: '',
  profesion: '',
  notas_pac: '',
};

function ClinicalHistory() {
  const { patientCache } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Full patient record, fetched after a selection — feeds visitas (the one
  // display-only field not editable in fichaForm).
  const [fullPatient, setFullPatient] = useState(null);

  // Fila 1 / Fila 2 fields — editable, but not yet wired to any save/submit.
  const [fichaForm, setFichaForm] = useState(EMPTY_FICHA_FORM);

  // Holds the info-row fields so their .info-input-wrap scroll positions can
  // be reset to the start after a patient loads (see the fullPatient effect
  // below), instead of keeping wherever mid-scroll a previous edit left them.
  const infoContainerRef = useRef(null);

  // Same idea as infoContainerRef, but for notas_pac's own vertical scroll
  // (it's a single textarea outside patient-info-container, not a wrapped
  // horizontal field, so it gets its own ref instead of a querySelectorAll).
  const notasPacRef = useRef(null);

  // Same scroll-reset idea, for the odontograma's Observaciones textarea.
  // Local-only state for now — there's no odontogramas table/route yet, so
  // this never gets populated or cleared from a patient fetch, but the ref
  // is already wired into the same reset effect below for when it does.
  const observacionesRef = useRef(null);
  const [observaciones, setObservaciones] = useState('');

  // A field left mid-scroll (from typing past the visible edge) snaps back
  // to showing its start once the user clicks away, rather than staying
  // wherever the caret happened to leave it.
  const resetScrollOnBlur = (e) => {
    e.target.parentElement.scrollLeft = 0;
  };

  // Runs after every patient load/clear (not on typing) since fullPatient
  // only changes on those, not on each keystroke.
  useEffect(() => {
    if (infoContainerRef.current) {
      infoContainerRef.current.querySelectorAll('.info-input-wrap').forEach((wrap) => {
        wrap.scrollLeft = 0;
      });
    }
    if (notasPacRef.current) {
      notasPacRef.current.scrollTop = 0;
    }
    if (observacionesRef.current) {
      observacionesRef.current.scrollTop = 0;
    }
  }, [fullPatient]);

  // Typing a birth date recomputes the read-only age field via calculateAge.
  const handleFichaFieldChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fecha_nac') {
      setFichaForm((prev) => ({ ...prev, fecha_nac: value, edad: calculateAge(value) }));
    } else {
      setFichaForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Filters the already-loaded patient cache client-side as the user types,
  // rather than hitting the backend on every keystroke.
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 1) {
      const filtered = patientCache.filter((p) => {
        const searchLower = value.toLowerCase();
        return (
          p.nombre.toLowerCase().includes(searchLower) ||
          p.apellidos.toLowerCase().includes(searchLower) ||
          (p.celular && p.celular.toLowerCase().includes(searchLower)) ||
          (p.telefono && p.telefono.toLowerCase().includes(searchLower))
        );
      });
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowDropdown(false);
    }
  };

  // Pressing Enter selects the top filtered match, same as clicking it.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredPatients.length > 0) {
      handleSelectPatient(filteredPatients[0]);
    }
  };

  // The cache only has minimal fields, so picking a patient triggers a
  // fetch for their full record; the status icon reflects how that went.
  const handleSelectPatient = async (patient) => {
    setSearchTerm(`${patient.nombre} ${patient.apellidos}`);
    setShowDropdown(false);
    setLoadingStatus('loading');

    try {
      const res = await fetch(`http://localhost:5000/patients/${patient.id_pac}`);
      if (!res.ok) throw new Error('Error fetching full patient data');
      const data = await res.json();
      setFullPatient(data);
      setFichaForm({
        nombre: data.nombre || '',
        apellidos: data.apellidos || '',
        fecha_nac: data.fecha_nac || '',
        edad: calculateAge(data.fecha_nac),
        celular: data.celular || '',
        telefono: data.telefono || '',
        domicilio: data.domicilio || '',
        zona: data.zona || '',
        profesion: data.profesion || '',
        notas_pac: data.notas_pac || '',
      });
      setLoadingStatus('success');
    } catch (err) {
      console.error(err);
      setFullPatient(null);
      setFichaForm(EMPTY_FICHA_FORM);
      setLoadingStatus('error');
    }

    // Clear loading status after 3 seconds
    setTimeout(() => {
      setLoadingStatus('');
    }, 3000);
  };

  const handleClearSelection = () => {
    setSearchTerm('');
    setFullPatient(null);
    setFichaForm(EMPTY_FICHA_FORM);
    setFilteredPatients([]);
    setShowDropdown(false);
    setLoadingStatus('');
  };

  return (
    <div className="ClinicalHistory">
      <section className="search-bar-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Seleccionar Paciente..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            maxLength={100}
            onFocus={() => searchTerm.length >= 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />

          {searchTerm && (
            <MdCancel
              className="clear-icon"
              onClick={handleClearSelection}
              style={{
                right: loadingStatus ? '35px' : '10px'
              }}
            />
          )}

          {loadingStatus === 'loading' && <div className="spinner"></div>}
          {loadingStatus === 'success' && <FaCheckCircle className="status-icon success" />}
          {loadingStatus === 'error' && <FaTimesCircle className="status-icon error" />}

          {showDropdown && filteredPatients.length > 0 && (
            <ul className="search-dropdown">
              {filteredPatients.map((patient) => (
                <li key={patient.id_pac} onClick={() => handleSelectPatient(patient)}>
                  <span className="patient-name">
                    Paciente: {patient.nombre} {patient.apellidos}
                  </span>
                  <span className="patient-celular">{patient.celular || '--'}</span>
                  <span className="patient-telefono">{patient.telefono || '--'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="delete-patient-btn">Borrar Paciente</button>
      </section>

      <section className="patient-info-container" ref={infoContainerRef}>
        <div className="info-row row-1">
          <div className="info-item flex-2">
            <span className="info-label">Nombre:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="nombre"
                className="info-input"
                placeholder="---"
                maxLength={50}
                value={fichaForm.nombre}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-2">
            <span className="info-label">Apellidos:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="apellidos"
                className="info-input"
                placeholder="---"
                maxLength={50}
                value={fichaForm.apellidos}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-2">
            <span className="info-label">Fecha de Nacimiento:</span>
            <input
              type="date"
              name="fecha_nac"
              className="info-input"
              value={fichaForm.fecha_nac}
              onChange={handleFichaFieldChange}
            />
          </div>
          <div className="info-item flex-1">
            <span className="info-label">Edad:</span>
            <span className={`info-value${fichaForm.edad === '' ? ' info-value-empty' : ''}`}>
              {fichaForm.edad !== '' ? fichaForm.edad : '---'}
            </span>
          </div>
          <div className="info-item flex-1">
            <span className="info-label">Visitas:</span>
            <span className={`info-value${fullPatient?.visitas == null ? ' info-value-empty' : ''}`}>
              {fullPatient?.visitas ?? '---'}
            </span>
          </div>
        </div>
        <div className="info-row">
          <div className="info-item flex-1">
            <span className="info-label">Celular:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="celular"
                className="info-input"
                placeholder="---"
                maxLength={25}
                value={fichaForm.celular}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-1">
            <span className="info-label">Teléfono:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="telefono"
                className="info-input"
                placeholder="---"
                maxLength={25}
                value={fichaForm.telefono}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-2">
            <span className="info-label">Domicilio:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="domicilio"
                className="info-input"
                placeholder="---"
                maxLength={100}
                value={fichaForm.domicilio}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-1">
            <span className="info-label">Zona:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="zona"
                className="info-input"
                placeholder="---"
                maxLength={50}
                value={fichaForm.zona}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
          <div className="info-item flex-2">
            <span className="info-label">Profesión:</span>
            <div className="info-input-wrap">
              <input
                type="text"
                name="profesion"
                className="info-input"
                placeholder="---"
                maxLength={50}
                value={fichaForm.profesion}
                onChange={handleFichaFieldChange}
                onBlur={resetScrollOnBlur}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="notes-billing-container">
        <div className="notas-pac">
          <span className="info-label">Notas del Paciente:</span>
          <textarea
            ref={notasPacRef}
            name="notas_pac"
            className="notas-pac-input"
            placeholder="---"
            maxLength={500}
            value={fichaForm.notas_pac}
            onChange={handleFichaFieldChange}
            onBlur={(e) => { e.target.scrollTop = 0; }}
          />
        </div>
        <div className="cobros-saldo">
          <div className="info-item cobros-item">
            <span className="info-label">Cobros Totales:</span>
            <span className={`info-value${fullPatient?.cobros_totales == null ? ' info-value-empty' : ''}`}>
              {formatCurrency(fullPatient?.cobros_totales)}
            </span>
          </div>
          <div className="info-item saldo-item">
            <span className="info-label">Saldo:</span>
            <span
              className={`info-value${
                fullPatient?.saldo == null
                  ? ' info-value-empty'
                  : ` ${getSaldoColorClass(fullPatient.saldo)}`
              }`}
            >
              {formatCurrency(fullPatient?.saldo)}
            </span>
          </div>
        </div>
      </section>

      <section className="odontograma-container">
        <div className="odontograma">
          <h2 className="placeholder-label">[ Odontograma ]</h2>
        </div>
        <div className="odontograma-notes">
          <span className="observaciones-title">Observaciones</span>
          <textarea
            ref={observacionesRef}
            name="observaciones"
            className="observaciones-input"
            placeholder="---"
            maxLength={2000}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            onBlur={(e) => { e.target.scrollTop = 0; }}
          />
        </div>
      </section>

      <section className="action-buttons-container">
        <button className="cancelar-btn">Cancelar</button>
        <button className="guardar-btn">Guardar</button>
      </section>
    </div>
  );
}

export default ClinicalHistory;
