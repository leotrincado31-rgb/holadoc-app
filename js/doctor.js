// ============================================================================
// HolaDoc! — Módulo Doctor
// ============================================================================
// Renderiza todas las vistas del panel médico dentro de un contenedor SPA.
// Depende de: HolaDocStorage, HolaDocApp, HolaDocNotifications
// ============================================================================

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────────────────
  // CONSTANTES
  // ──────────────────────────────────────────────────────────────────────────

  const SPECIALTIES = [
    'Clínica Médica','Cardiología','Dermatología','Endocrinología',
    'Gastroenterología','Ginecología','Nefrología','Neumonología',
    'Neurología','Oftalmología','Otorrinolaringología','Pediatría',
    'Psiquiatría','Traumatología','Urología'
  ];

  const DAYS = [
    { key: 'lunes',    label: 'Lunes' },
    { key: 'martes',   label: 'Martes' },
    { key: 'miercoles',label: 'Miércoles' },
    { key: 'jueves',   label: 'Jueves' },
    { key: 'viernes',  label: 'Viernes' },
    { key: 'sabado',   label: 'Sábado' },
    { key: 'domingo',  label: 'Domingo' }
  ];

  const MONTHS = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];

  const DAY_NAMES = [
    'Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'
  ];

  const NORMAL_RANGES = {
    bloodPressureSys: { min: 90, max: 140 },
    bloodPressureDia: { min: 60, max: 90 },
    glucose:          { min: 70, max: 140 },
    heartRate:        { min: 60, max: 100 },
    temperature:      { min: 36, max: 37.5 }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  function _storage()       { return window.HolaDocStorage; }
  function _app()           { return window.HolaDocApp; }
  function _notifications() { return window.HolaDocNotifications; }

  /** Fecha corta: DD/MM/YYYY */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  /** Fecha larga: "Jueves 17 de julio de 2025" */
  function formatDateLong(dateStr) {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d)) return dateStr;
    const dayName = DAY_NAMES[d.getDay()];
    const day     = d.getDate();
    const month   = MONTHS[d.getMonth()];
    const year    = d.getFullYear();
    return `${dayName} ${day} de ${month} de ${year}`;
  }

  /** Tiempo relativo: "Hace 5 minutos" */
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now  = Date.now();
    const past = new Date(dateStr).getTime();
    const diff = Math.max(0, now - past);
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Hace un momento';
    if (mins < 60)  return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 30)  return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return formatDate(dateStr);
  }

  function getRequestTypeLabel(type) {
    const map = { receta:'Receta', derivacion:'Derivación', estudio:'Estudio', internacion:'Internación' };
    return map[type] || type;
  }

  function getRequestTypeIcon(type) {
    const map = { receta:'💊', derivacion:'🔄', estudio:'🔬', internacion:'🏥' };
    return map[type] || '📋';
  }

  function getStatusLabel(status) {
    const map = {
      pendiente:'Pendiente', en_proceso:'En proceso', completada:'Completada',
      rechazada:'Rechazada', confirmado:'Confirmado', completado:'Completado',
      cancelado:'Cancelado'
    };
    return map[status] || status;
  }

  function getStatusBadgeClass(status) {
    const map = {
      pendiente:'badge-pending', en_proceso:'badge-pending',
      completada:'badge-completed', rechazada:'badge-rejected',
      confirmado:'badge-active', completado:'badge-completed',
      cancelado:'badge-rejected'
    };
    return map[status] || 'badge';
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  function todayISO() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  function calcAge(birthDate) {
    if (!birthDate) return '—';
    const b = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }

  function isOutOfRange(key, value) {
    const range = NORMAL_RANGES[key];
    if (!range || value == null || value === '') return false;
    return value < range.min || value > range.max;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function patientName(dni) {
    const p = _storage().getPatient(dni);
    return p ? p.name : dni;
  }

  function patientObj(dni) {
    return _storage().getPatient(dni);
  }

  function currentDoctor() {
    const u = _storage().getCurrentUser();
    if (!u || u.type !== 'doctor') return null;
    return _storage().getDoctor(u.dni) || u;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderDashboard
  // ──────────────────────────────────────────────────────────────────────────

  function renderDashboard(container) {
    container.innerHTML = '';
    const doc   = currentDoctor();
    if (!doc) { container.innerHTML = '<p class="text-center mt-3">No se pudo cargar el perfil del médico.</p>'; return; }

    const today        = todayISO();
    const appointments = _storage().getAppointments({ doctorDni: doc.dni, date: today });
    const allRequests  = _storage().getRequests({ doctorDni: doc.dni, status: 'pendiente' });
    const allAppts     = _storage().getAppointments({ doctorDni: doc.dni });

    // Unique active patients (any appointment or request)
    const patientDnis = new Set();
    allAppts.forEach(a => patientDnis.add(a.patientDni));
    allRequests.forEach(r => patientDnis.add(r.patientDni));

    const todaySorted  = [...appointments].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const recentReqs   = [...allRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Patients with pending requests (quick lookup)
    const patientsWithPendingReq = new Set(allRequests.map(r => r.patientDni));

    const html = `
      <div class="page-enter">
        <!-- Welcome -->
        <div class="mb-3">
          <h1 class="page-title">⚕️ Hola, Dr./Dra. ${escapeHtml(doc.name)}</h1>
          <p class="page-subtitle">${formatDateLong()}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-3 mb-3 stagger-children">
          <div class="card card-3d" style="border-left:4px solid var(--color-primary, #3b82f6)">
            <div class="card-body text-center">
              <div style="font-size:2.2rem;font-weight:800">${todaySorted.length}</div>
              <div class="text-muted">📅 Turnos hoy</div>
            </div>
          </div>
          <div class="card card-3d" style="border-left:4px solid var(--color-warning, #f59e0b)">
            <div class="card-body text-center">
              <div style="font-size:2.2rem;font-weight:800">${allRequests.length}</div>
              <div class="text-muted">📋 Solicitudes pendientes</div>
            </div>
          </div>
          <div class="card card-3d" style="border-left:4px solid var(--color-success, #14b8a6)">
            <div class="card-body text-center">
              <div style="font-size:2.2rem;font-weight:800">${patientDnis.size}</div>
              <div class="text-muted">👥 Pacientes activos</div>
            </div>
          </div>
        </div>

        <!-- Turnos de hoy -->
        <div class="section mb-3">
          <h2 class="section-title">Próximos turnos de hoy</h2>
          ${todaySorted.length === 0
            ? '<div class="empty-state"><div class="empty-state-icon">🗓️</div><p class="empty-state-text">No tenés turnos hoy</p></div>'
            : `<div class="stagger-children">${todaySorted.map(a => {
                const hasPending = patientsWithPendingReq.has(a.patientDni);
                return `
                  <div class="list-item card mb-1">
                    <div class="list-item-content flex-between">
                      <div>
                        <span style="font-weight:700;font-size:1.1rem;margin-right:.5rem">${escapeHtml(a.time || '—')}</span>
                        <a href="javascript:void(0)" class="dash-patient-link" data-dni="${a.patientDni}" style="color:var(--color-primary);cursor:pointer;font-weight:600">
                          ${escapeHtml(patientName(a.patientDni))}
                        </a>
                        ${hasPending ? '<span class="badge badge-pending" style="margin-left:.5rem;font-size:.7rem">Solicitud</span>' : ''}
                      </div>
                      <span class="badge ${getStatusBadgeClass(a.status)}">${getStatusLabel(a.status)}</span>
                    </div>
                  </div>`;
              }).join('')}</div>`
          }
        </div>

        <!-- Solicitudes recientes -->
        <div class="section">
          <div class="flex-between mb-1">
            <h2 class="section-title" style="margin:0">Solicitudes recientes</h2>
            <a href="javascript:void(0)" id="dash-ver-todas" style="color:var(--color-primary);font-weight:600;cursor:pointer">Ver todas →</a>
          </div>
          ${recentReqs.length === 0
            ? '<p class="text-muted">Sin solicitudes pendientes 🎉</p>'
            : `<div class="stagger-children">${recentReqs.map(r => `
                <div class="list-item card mb-1 dash-req-link" data-dni="${r.patientDni}" style="cursor:pointer">
                  <div class="list-item-content flex-between">
                    <div>
                      <span style="margin-right:.35rem">${getRequestTypeIcon(r.type)}</span>
                      <strong>${getRequestTypeLabel(r.type)}</strong>
                      <span class="text-muted" style="margin-left:.5rem">— ${escapeHtml(patientName(r.patientDni))}</span>
                    </div>
                    <div>
                      <span class="text-muted" style="font-size:.85rem;margin-right:.5rem">${timeAgo(r.createdAt)}</span>
                      <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
                    </div>
                  </div>
                </div>`).join('')}</div>`
          }
        </div>
      </div>`;

    container.innerHTML = html;

    // Events
    container.querySelectorAll('.dash-patient-link').forEach(link => {
      link.addEventListener('click', () => _app().navigate(`#/doctor/paciente/${link.dataset.dni}`));
    });
    container.querySelectorAll('.dash-req-link').forEach(link => {
      link.addEventListener('click', () => _app().navigate(`#/doctor/paciente/${link.dataset.dni}`));
    });
    const verTodas = container.querySelector('#dash-ver-todas');
    if (verTodas) verTodas.addEventListener('click', () => _app().navigate('#/doctor/solicitudes'));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderSchedule
  // ──────────────────────────────────────────────────────────────────────────

  function renderSchedule(container) {
    container.innerHTML = '';
    const doc = currentDoctor();
    if (!doc) { container.innerHTML = '<p class="text-center mt-3">Error al cargar perfil.</p>'; return; }

    let activeTab = 'config';

    function render() {
      const schedule = doc.schedule || {};
      const duration = doc.consultationDuration || 30;

      const html = `
        <div class="page-enter">
          <div class="page-header mb-2">
            <a href="javascript:void(0)" id="sched-back" class="page-back">← Volver</a>
            <h1 class="page-title">🗓️ Mi Agenda</h1>
          </div>

          <div class="tabs mb-2">
            <button class="tab ${activeTab === 'config' ? 'tab--active' : ''}" data-tab="config">⚙️ Configuración</button>
            <button class="tab ${activeTab === 'week' ? 'tab--active' : ''}" data-tab="week">📆 Agenda de la semana</button>
          </div>

          <div id="sched-content"></div>
        </div>`;

      container.innerHTML = html;

      container.querySelector('#sched-back').addEventListener('click', () => _app().navigate('#/doctor'));
      container.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', () => { activeTab = t.dataset.tab; render(); });
      });

      const content = container.querySelector('#sched-content');
      if (activeTab === 'config') renderScheduleConfig(content, doc, schedule, duration);
      else renderScheduleWeek(content, doc);
    }

    render();
  }

  function renderScheduleConfig(content, doc, schedule, duration) {
    const durationOptions = [15, 20, 30, 45, 60];

    const html = `
      <div class="card card-glass fade-in">
        <div class="card-body">
          <h3 style="margin-bottom:1rem">Horarios de atención</h3>
          ${DAYS.map(day => {
            const cfg = schedule[day.key] || { active: false, start: '08:00', end: '17:00' };
            return `
              <div class="form-group" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding:.6rem 0;border-bottom:1px solid rgba(128,128,128,.15)">
                <label style="display:flex;align-items:center;gap:.5rem;min-width:160px;cursor:pointer">
                  <input type="checkbox" class="day-check" data-day="${day.key}" ${cfg.active ? 'checked' : ''} />
                  <strong>${day.label}</strong>
                </label>
                <div class="day-times" data-day="${day.key}" style="display:${cfg.active ? 'flex' : 'none'};align-items:center;gap:.5rem">
                  <span class="text-muted">Desde</span>
                  <input type="time" class="form-input day-start" data-day="${day.key}" value="${cfg.start || '08:00'}" style="width:auto" />
                  <span class="text-muted">Hasta</span>
                  <input type="time" class="form-input day-end" data-day="${day.key}" value="${cfg.end || '17:00'}" style="width:auto" />
                </div>
              </div>`;
          }).join('')}

          <div class="form-group mt-2">
            <label class="form-label">Duración de consulta</label>
            <select class="form-select" id="sched-duration">
              ${durationOptions.map(d => `<option value="${d}" ${d === duration ? 'selected' : ''}>${d} minutos</option>`).join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-lg btn-block mt-2" id="sched-save">GUARDAR CAMBIOS</button>
        </div>
      </div>`;

    content.innerHTML = html;

    // Toggle time inputs visibility
    content.querySelectorAll('.day-check').forEach(cb => {
      cb.addEventListener('change', () => {
        const times = content.querySelector(`.day-times[data-day="${cb.dataset.day}"]`);
        if (times) times.style.display = cb.checked ? 'flex' : 'none';
      });
    });

    // Save
    content.querySelector('#sched-save').addEventListener('click', () => {
      const newSchedule = {};
      DAYS.forEach(day => {
        const active = content.querySelector(`.day-check[data-day="${day.key}"]`).checked;
        const start  = content.querySelector(`.day-start[data-day="${day.key}"]`)?.value || '08:00';
        const end    = content.querySelector(`.day-end[data-day="${day.key}"]`)?.value || '17:00';
        newSchedule[day.key] = { active, start, end };
      });
      const newDuration = parseInt(content.querySelector('#sched-duration').value, 10);

      _storage().updateDoctor(doc.dni, { schedule: newSchedule, consultationDuration: newDuration });

      // Refresh cached doc
      Object.assign(doc, { schedule: newSchedule, consultationDuration: newDuration });

      _app().showToast('Agenda actualizada correctamente', 'success');
    });
  }

  function renderScheduleWeek(content, doc) {
    // Build a week view starting from Monday of the current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d);
    }

    const allAppts = _storage().getAppointments({ doctorDni: doc.dni });

    const html = `
      <div class="card card-glass fade-in" style="overflow-x:auto">
        <div class="card-body">
          <div class="calendar-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:.5rem;min-width:700px">
            ${weekDates.map(d => {
              const iso = d.toISOString().slice(0, 10);
              const dayKey = DAYS[((d.getDay() + 6) % 7)]?.key;
              const isToday = iso === todayISO();
              const dayAppts = allAppts.filter(a => a.date === iso).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
              return `
                <div class="calendar-day" style="border:1px solid rgba(128,128,128,.2);border-radius:.75rem;padding:.75rem;${isToday ? 'background:rgba(59,130,246,.08);border-color:var(--color-primary,#3b82f6)' : ''}">
                  <div style="font-weight:700;text-align:center;margin-bottom:.5rem">
                    ${DAY_NAMES[d.getDay()].slice(0, 3)}<br/>
                    <span style="font-size:1.3rem">${d.getDate()}</span>
                  </div>
                  ${dayAppts.length === 0
                    ? '<p class="text-muted text-center" style="font-size:.75rem">Sin turnos</p>'
                    : dayAppts.map(a => `
                        <div class="time-slot week-slot" data-dni="${a.patientDni}"
                             style="background:${a.status === 'confirmado' ? 'rgba(16,185,129,.12)' : a.status === 'pendiente' ? 'rgba(245,158,11,.12)' : a.status === 'completado' ? 'rgba(107,114,128,.1)' : 'rgba(239,68,68,.1)'};
                                    border-radius:.5rem;padding:.35rem .5rem;margin-bottom:.35rem;cursor:pointer;font-size:.8rem">
                          <strong>${escapeHtml(a.time || '')}</strong><br/>
                          <span>${escapeHtml(patientName(a.patientDni).split(' ')[0])}</span>
                        </div>`).join('')
                  }
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    content.innerHTML = html;

    content.querySelectorAll('.week-slot').forEach(slot => {
      slot.addEventListener('click', () => _app().navigate(`#/doctor/paciente/${slot.dataset.dni}`));
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderPatients
  // ──────────────────────────────────────────────────────────────────────────

  function renderPatients(container) {
    container.innerHTML = '';
    const doc = currentDoctor();
    if (!doc) return;

    const allAppts    = _storage().getAppointments({ doctorDni: doc.dni });
    const allRequests = _storage().getRequests({ doctorDni: doc.dni });

    // Unique patient DNIs
    const dniSet = new Set();
    allAppts.forEach(a => dniSet.add(a.patientDni));
    allRequests.forEach(r => dniSet.add(r.patientDni));

    const patients = [...dniSet].map(dni => _storage().getPatient(dni)).filter(Boolean);

    // Enrich with last visit & pending count
    const enriched = patients.map(p => {
      const appts = allAppts.filter(a => a.patientDni === p.dni).sort((a, b) => b.date.localeCompare(a.date));
      const pendingReqs = allRequests.filter(r => r.patientDni === p.dni && r.status === 'pendiente').length;
      return { ...p, lastVisit: appts[0]?.date || null, pendingRequests: pendingReqs };
    });

    function renderList(filter = '') {
      const q = filter.toLowerCase().trim();
      const filtered = q
        ? enriched.filter(p => p.name.toLowerCase().includes(q) || p.dni.includes(q))
        : enriched;

      const html = `
        <div class="page-enter">
          <h1 class="page-title mb-2">👥 Mis Pacientes</h1>

          <div class="form-group mb-2">
            <input type="text" class="form-input" id="pat-search" placeholder="Buscar por nombre o DNI..." value="${escapeHtml(filter)}" />
          </div>

          ${filtered.length === 0
            ? `<div class="empty-state fade-in">
                 <div class="empty-state-icon">🔍</div>
                 <p class="empty-state-title">Sin resultados</p>
                 <p class="empty-state-text">${enriched.length === 0 ? 'Aún no tenés pacientes registrados.' : 'No se encontraron pacientes con ese criterio.'}</p>
               </div>`
            : `<div class="stagger-children">${filtered.map(p => `
                <div class="list-item card mb-1 pat-card" data-dni="${p.dni}" style="cursor:pointer">
                  <div class="list-item-content" style="display:flex;align-items:center;gap:1rem">
                    <div class="avatar">${getInitials(p.name)}</div>
                    <div style="flex:1">
                      <div class="list-item-title">${escapeHtml(p.name)}</div>
                      <div class="list-item-subtitle text-muted">DNI: ${escapeHtml(p.dni)} · ${escapeHtml(p.obraSocial || 'Sin obra social')}</div>
                      ${p.lastVisit ? `<div class="text-muted" style="font-size:.8rem">Última visita: ${formatDate(p.lastVisit)}</div>` : ''}
                    </div>
                    ${p.pendingRequests > 0 ? `<span class="badge badge-pending">${p.pendingRequests} solicitud${p.pendingRequests > 1 ? 'es' : ''}</span>` : ''}
                  </div>
                </div>`).join('')}</div>`
          }
        </div>`;

      container.innerHTML = html;

      const search = container.querySelector('#pat-search');
      if (search) {
        search.focus();
        search.addEventListener('input', () => renderList(search.value));
      }
      container.querySelectorAll('.pat-card').forEach(card => {
        card.addEventListener('click', () => _app().navigate(`#/doctor/paciente/${card.dataset.dni}`));
      });
    }

    renderList();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderPatientDetail
  // ──────────────────────────────────────────────────────────────────────────

  function renderPatientDetail(container, patientDni) {
    container.innerHTML = '';
    const doc = currentDoctor();
    const pat = _storage().getPatient(patientDni);
    if (!doc || !pat) {
      container.innerHTML = '<p class="text-center mt-3">Paciente no encontrado.</p>';
      return;
    }

    let activeTab = 'historia';

    function render() {
      const age = calcAge(pat.birthDate);

      const html = `
        <div class="page-enter">
          <div class="page-header mb-2">
            <a href="javascript:void(0)" id="pd-back" class="page-back">← Volver a pacientes</a>
          </div>

          <!-- Patient Info Card -->
          <div class="card card-glass mb-2">
            <div class="card-body" style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap">
              <div class="avatar avatar-lg">${getInitials(pat.name)}</div>
              <div style="flex:1;min-width:200px">
                <h2 style="margin:0 0 .25rem">${escapeHtml(pat.name)}</h2>
                <div class="text-muted" style="line-height:1.7">
                  🪪 DNI: <strong>${escapeHtml(pat.dni)}</strong><br/>
                  🏥 Obra Social: <strong>${escapeHtml(pat.obraSocial || '—')}</strong> · Nro: <strong>${escapeHtml(pat.nroAfiliado || '—')}</strong><br/>
                  📞 ${escapeHtml(pat.phone || '—')} · 🎂 ${formatDate(pat.birthDate)} (${age} años)
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs mb-2">
            <button class="tab ${activeTab === 'historia' ? 'tab--active' : ''}" data-tab="historia">📋 Historia Clínica</button>
            <button class="tab ${activeTab === 'indicadores' ? 'tab--active' : ''}" data-tab="indicadores">📊 Indicadores</button>
            <button class="tab ${activeTab === 'solicitudes' ? 'tab--active' : ''}" data-tab="solicitudes">📝 Solicitudes</button>
            <button class="tab ${activeTab === 'turnos' ? 'tab--active' : ''}" data-tab="turnos">📅 Turnos</button>
          </div>

          <div id="pd-tab-content"></div>
        </div>`;

      container.innerHTML = html;

      container.querySelector('#pd-back').addEventListener('click', () => _app().navigate('#/doctor/pacientes'));
      container.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', () => { activeTab = t.dataset.tab; render(); });
      });

      const tabContent = container.querySelector('#pd-tab-content');
      switch (activeTab) {
        case 'historia':     renderTabHistoria(tabContent, doc, pat); break;
        case 'indicadores':  renderTabIndicadores(tabContent, pat); break;
        case 'solicitudes':  renderTabSolicitudes(tabContent, doc, pat); break;
        case 'turnos':       renderTabTurnos(tabContent, doc, pat); break;
      }
    }

    render();
  }

  // ── Tab: Historia Clínica ─────────────────────────────────────────────────

  function renderTabHistoria(content, doc, pat) {
    const records = _storage().getRecords(pat.dni).sort((a, b) => new Date(b.date) - new Date(a.date));
    let showForm = false;

    function draw() {
      const html = `
        <div class="fade-in">
          <button class="btn btn-primary mb-2" id="hc-new-entry">+ Nueva Entrada</button>

          ${showForm ? buildRecordForm(doc) : ''}

          ${records.length === 0
            ? '<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">No hay registros en la historia clínica.</p></div>'
            : `<div class="timeline stagger-children">${records.map(r => {
                const drName = _storage().getDoctor(r.doctorDni)?.name || r.doctorDni;
                return `
                  <div class="timeline-item card mb-2">
                    <div class="card-body">
                      <div class="timeline-date flex-between">
                        <strong>${formatDate(r.date)}</strong>
                        <span class="text-muted" style="font-size:.85rem">Registrado por Dr. ${escapeHtml(drName)}</span>
                      </div>
                      ${r.reason ? `<p>📋 <strong>Motivo de consulta:</strong> ${escapeHtml(r.reason)}</p>` : ''}
                      ${r.pathologicalHistory ? `<p>🏥 <strong>Antecedentes patológicos:</strong> ${escapeHtml(r.pathologicalHistory)}</p>` : ''}
                      ${r.surgicalHistory ? `<p>🔪 <strong>Antecedentes quirúrgicos:</strong> ${escapeHtml(r.surgicalHistory)}</p>` : ''}
                      ${r.currentMedication ? `<p>💊 <strong>Medicación actual:</strong> ${escapeHtml(r.currentMedication)}</p>` : ''}
                      ${r.nextObjectives ? `<p>🎯 <strong>Objetivos próxima consulta:</strong> ${escapeHtml(r.nextObjectives)}</p>` : ''}
                      ${r.notes ? `<p>📝 <strong>Notas:</strong> ${escapeHtml(r.notes)}</p>` : ''}
                    </div>
                  </div>`;
              }).join('')}</div>`
          }
        </div>`;

      content.innerHTML = html;

      content.querySelector('#hc-new-entry').addEventListener('click', () => { showForm = !showForm; draw(); });

      if (showForm) {
        content.querySelector('#hc-save').addEventListener('click', () => {
          const reason = content.querySelector('#hc-reason').value.trim();
          if (!reason) { _app().showToast('El motivo de consulta es obligatorio', 'error'); return; }

          _storage().saveRecord({
            id: _storage().generateId('rec'),
            patientDni: pat.dni,
            doctorDni: doc.dni,
            date: todayISO(),
            reason,
            pathologicalHistory: content.querySelector('#hc-pathological').value.trim(),
            surgicalHistory:     content.querySelector('#hc-surgical').value.trim(),
            currentMedication:   content.querySelector('#hc-medication').value.trim(),
            nextObjectives:      content.querySelector('#hc-objectives').value.trim(),
            notes:               content.querySelector('#hc-notes').value.trim()
          });

          _app().showToast('Entrada guardada correctamente', 'success');
          showForm = false;

          // Refresh records list
          const updatedRecords = _storage().getRecords(pat.dni).sort((a, b) => new Date(b.date) - new Date(a.date));
          records.length = 0;
          records.push(...updatedRecords);
          draw();
        });

        content.querySelector('#hc-cancel')?.addEventListener('click', () => { showForm = false; draw(); });
      }
    }

    draw();
  }

  function buildRecordForm(doc) {
    return `
      <div class="card card-glass mb-2 slide-up">
        <div class="card-header flex-between">
          <strong>Nueva Entrada — ${formatDate(todayISO())}</strong>
          <button class="btn btn-outline btn-icon" id="hc-cancel" title="Cancelar">✕</button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Motivo de consulta *</label>
            <textarea class="form-textarea" id="hc-reason" rows="2" placeholder="Describa el motivo de la consulta..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Antecedentes patológicos</label>
            <textarea class="form-textarea" id="hc-pathological" rows="2" placeholder="Antecedentes relevantes..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Antecedentes quirúrgicos</label>
            <textarea class="form-textarea" id="hc-surgical" rows="2" placeholder="Cirugías previas..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Medicación actual</label>
            <textarea class="form-textarea" id="hc-medication" rows="2" placeholder="Medicamentos en curso..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Objetivos para próxima consulta</label>
            <textarea class="form-textarea" id="hc-objectives" rows="2" placeholder="Seguimiento, estudios, etc..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Notas adicionales</label>
            <textarea class="form-textarea" id="hc-notes" rows="2" placeholder="Cualquier observación adicional..."></textarea>
          </div>
          <button class="btn btn-success btn-lg btn-block" id="hc-save">💾 GUARDAR</button>
        </div>
      </div>`;
  }

  // ── Tab: Indicadores ──────────────────────────────────────────────────────

  function renderTabIndicadores(content, pat) {
    const data = _storage().getHealthData(pat.dni, 10);
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      content.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-state-icon">📊</div>
          <p class="empty-state-title">Sin datos de salud</p>
          <p class="empty-state-text">El paciente aún no registró indicadores.</p>
        </div>`;
      return;
    }

    function valueCell(key, value, unit) {
      if (value == null || value === '') return `<span class="text-muted">—</span>`;
      const out = isOutOfRange(key, value);
      return `<span class="health-value" style="${out ? 'color:var(--color-danger,#ef4444);font-weight:800' : ''}">${value}</span> <span class="health-unit text-muted">${unit}</span>`;
    }

    const html = `
      <div class="fade-in" style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.9rem">
          <thead>
            <tr style="border-bottom:2px solid rgba(128,128,128,.2)">
              <th style="text-align:left;padding:.6rem .4rem">Fecha</th>
              <th style="text-align:center;padding:.6rem .4rem">PA (sys/dia)</th>
              <th style="text-align:center;padding:.6rem .4rem">Peso (kg)</th>
              <th style="text-align:center;padding:.6rem .4rem">Glucosa</th>
              <th style="text-align:center;padding:.6rem .4rem">Temp (°C)</th>
              <th style="text-align:center;padding:.6rem .4rem">FC (bpm)</th>
              <th style="text-align:left;padding:.6rem .4rem">Notas</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(d => {
              const sysOut = isOutOfRange('bloodPressureSys', d.bloodPressureSys);
              const diaOut = isOutOfRange('bloodPressureDia', d.bloodPressureDia);
              const bpStyle = (sysOut || diaOut) ? 'color:var(--color-danger,#ef4444);font-weight:800' : '';
              return `
                <tr style="border-bottom:1px solid rgba(128,128,128,.1)">
                  <td style="padding:.5rem .4rem">${formatDate(d.date)}</td>
                  <td style="text-align:center;padding:.5rem .4rem;${bpStyle}">
                    ${d.bloodPressureSys != null ? `${d.bloodPressureSys}/${d.bloodPressureDia}` : '—'}
                  </td>
                  <td style="text-align:center;padding:.5rem .4rem">${d.weight != null ? d.weight : '—'}</td>
                  <td style="text-align:center;padding:.5rem .4rem">${valueCell('glucose', d.glucose, '')}</td>
                  <td style="text-align:center;padding:.5rem .4rem">${valueCell('temperature', d.temperature, '')}</td>
                  <td style="text-align:center;padding:.5rem .4rem">${valueCell('heartRate', d.heartRate, '')}</td>
                  <td style="padding:.5rem .4rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(d.notes || '')}">${escapeHtml(d.notes || '—')}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
        <p class="text-muted mt-1" style="font-size:.8rem">⚠️ Los valores en <span style="color:var(--color-danger,#ef4444);font-weight:700">rojo</span> están fuera del rango normal.</p>
      </div>`;

    content.innerHTML = html;
  }

  // ── Tab: Solicitudes ──────────────────────────────────────────────────────

  function renderTabSolicitudes(content, doc, pat) {
    function draw() {
      const requests = _storage().getRequests({ doctorDni: doc.dni, patientDni: pat.dni })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (requests.length === 0) {
        content.innerHTML = `
          <div class="empty-state fade-in">
            <div class="empty-state-icon">📝</div>
            <p class="empty-state-text">No hay solicitudes de este paciente.</p>
          </div>`;
        return;
      }

      const html = `
        <div class="stagger-children fade-in">
          ${requests.map(r => {
            const isPending = r.status === 'pendiente';
            const detailsHtml = buildRequestDetailsPreview(r);
            return `
              <div class="card mb-2">
                <div class="card-body">
                  <div class="flex-between mb-1">
                    <div>
                      <span style="font-size:1.3rem;margin-right:.35rem">${getRequestTypeIcon(r.type)}</span>
                      <strong>${getRequestTypeLabel(r.type)}</strong>
                    </div>
                    <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
                  </div>
                  <div class="text-muted mb-1" style="font-size:.85rem">${timeAgo(r.createdAt)}</div>
                  ${detailsHtml}
                  ${isPending ? buildRequestActions(r) : ''}
                  ${r.response ? buildResponsePreview(r) : ''}
                </div>
              </div>`;
          }).join('')}
        </div>`;

      content.innerHTML = html;
      attachRequestActionListeners(content, doc, pat, draw);
    }

    draw();
  }

  function buildRequestDetailsPreview(r) {
    const d = r.details || {};
    let parts = [];
    if (r.type === 'receta' && d.medications)  parts.push(`💊 Medicamentos: ${escapeHtml(d.medications)}`);
    if (r.type === 'derivacion' && d.specialty) parts.push(`🏥 Especialidad: ${escapeHtml(d.specialty)}`);
    if (r.type === 'estudio' && d.studyType)    parts.push(`🔬 Estudio: ${escapeHtml(d.studyType)}`);
    if (r.type === 'internacion' && d.reason)   parts.push(`🏥 Motivo: ${escapeHtml(d.reason)}`);
    if (d.notes) parts.push(`📝 Notas: ${escapeHtml(d.notes)}`);
    if (parts.length === 0) return '';
    return `<div style="background:rgba(128,128,128,.06);border-radius:.5rem;padding:.6rem;font-size:.9rem;margin-bottom:.75rem">${parts.join('<br/>')}</div>`;
  }

  function buildResponsePreview(r) {
    const resp = r.response;
    if (!resp) return '';
    let parts = [];
    if (resp.prescribedMedications) parts.push(`💊 Recetado: ${escapeHtml(resp.prescribedMedications)}`);
    if (resp.diagnosis)             parts.push(`🩺 Diagnóstico: ${escapeHtml(resp.diagnosis)}`);
    if (resp.instructions)          parts.push(`📋 Indicaciones: ${escapeHtml(resp.instructions)}`);
    if (resp.rejectionReason)       parts.push(`❌ Motivo rechazo: ${escapeHtml(resp.rejectionReason)}`);
    if (parts.length === 0) return '';
    return `<div style="background:rgba(16,185,129,.06);border-radius:.5rem;padding:.6rem;font-size:.9rem;margin-top:.5rem;border-left:3px solid var(--color-success,#10b981)">${parts.join('<br/>')}</div>`;
  }

  function buildRequestActions(r) {
    if (r.type === 'receta') {
      return `<div class="mt-1"><button class="btn btn-primary req-complete-receta" data-id="${r.id}">📝 Completar Receta</button></div>`;
    }
    return `
      <div class="mt-1" style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-success req-approve" data-id="${r.id}">✅ Aprobar</button>
        <button class="btn btn-danger req-reject" data-id="${r.id}">❌ Rechazar</button>
      </div>`;
  }

  function attachRequestActionListeners(scope, doc, pat, refreshFn) {
    // Complete receta
    scope.querySelectorAll('.req-complete-receta').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.dataset.id;
        const req   = _storage().getRequests({ doctorDni: doc.dni }).find(r => r.id === reqId);
        if (!req) return;
        showPrescriptionModal(doc, pat, req, refreshFn);
      });
    });

    // Approve
    scope.querySelectorAll('.req-approve').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.dataset.id;
        _storage().updateRequest(reqId, { status: 'completada', resolvedAt: new Date().toISOString() });
        _notifications().createNotification(pat.dni, 'patient', 'solicitud', 'Solicitud aprobada', `Tu solicitud ha sido aprobada por el Dr. ${doc.name}.`, reqId);
        _app().showToast('Solicitud aprobada', 'success');
        refreshFn();
      });
    });

    // Reject
    scope.querySelectorAll('.req-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.dataset.id;
        showRejectModal(doc, pat, reqId, refreshFn);
      });
    });
  }

  // ── Prescription Modal ────────────────────────────────────────────────────

  function showPrescriptionModal(doc, pat, req, refreshFn) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const medications = req.details?.medications || '';

    overlay.innerHTML = `
      <div class="modal slide-up" style="max-width:550px">
        <div class="modal-header flex-between">
          <h3>📝 Emitir Receta</h3>
          <button class="modal-close" id="presc-close">✕</button>
        </div>
        <div class="card-body">
          <div class="prescription-card mb-2" style="background:rgba(128,128,128,.04);border-radius:.75rem;padding:1rem;border:1px dashed rgba(128,128,128,.25)">
            <div class="prescription-header mb-1">
              <strong>Paciente:</strong> ${escapeHtml(pat.name)}<br/>
              <strong>DNI:</strong> ${escapeHtml(pat.dni)}<br/>
              <strong>Obra Social:</strong> ${escapeHtml(pat.obraSocial || '—')} · <strong>Nro:</strong> ${escapeHtml(pat.nroAfiliado || '—')}
            </div>
            <p><strong>Medicamentos solicitados:</strong><br/>${escapeHtml(medications) || '<em>No especificados</em>'}</p>
          </div>

          <div class="form-group">
            <label class="form-label">Medicamentos recetados *</label>
            <textarea class="form-textarea" id="presc-meds" rows="3" placeholder="Ej: Losartán 50mg – 1 comprimido/día...">${escapeHtml(medications)}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <textarea class="form-textarea" id="presc-diag" rows="2" placeholder="Diagnóstico..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Indicaciones</label>
            <textarea class="form-textarea" id="presc-instr" rows="2" placeholder="Instrucciones para el paciente..."></textarea>
          </div>

          <div class="prescription-stamp text-muted" style="text-align:right;font-style:italic;margin:.75rem 0">
            ✒️ Dr. ${escapeHtml(doc.name)} — Mat. ${escapeHtml(doc.matricula || '—')}
          </div>

          <button class="btn btn-success btn-lg btn-block" id="presc-emit">📋 EMITIR RECETA</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#presc-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#presc-emit').addEventListener('click', () => {
      const meds  = overlay.querySelector('#presc-meds').value.trim();
      if (!meds) { _app().showToast('Debe indicar los medicamentos recetados', 'error'); return; }

      const diag  = overlay.querySelector('#presc-diag').value.trim();
      const instr = overlay.querySelector('#presc-instr').value.trim();

      _storage().updateRequest(req.id, {
        status: 'completada',
        resolvedAt: new Date().toISOString(),
        response: {
          prescribedMedications: meds,
          diagnosis: diag,
          instructions: instr,
          doctorName: doc.name,
          doctorMatricula: doc.matricula
        }
      });

      _notifications().createNotification(
        pat.dni, 'patient', 'receta',
        'Tu receta está lista',
        `El Dr. ${doc.name} emitió tu receta. Revisá los detalles en la app.`,
        req.id
      );

      _app().showToast('Receta emitida correctamente', 'success');
      overlay.remove();
      refreshFn();
    });
  }

  // ── Reject Modal ──────────────────────────────────────────────────────────

  function showRejectModal(doc, pat, reqId, refreshFn) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal slide-up" style="max-width:450px">
        <div class="modal-header flex-between">
          <h3>❌ Rechazar Solicitud</h3>
          <button class="modal-close" id="reject-close">✕</button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Motivo del rechazo *</label>
            <textarea class="form-textarea" id="reject-reason" rows="3" placeholder="Indique el motivo..."></textarea>
          </div>
          <button class="btn btn-danger btn-lg btn-block" id="reject-confirm">RECHAZAR SOLICITUD</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#reject-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#reject-confirm').addEventListener('click', () => {
      const reason = overlay.querySelector('#reject-reason').value.trim();
      if (!reason) { _app().showToast('Debe indicar el motivo del rechazo', 'error'); return; }

      _storage().updateRequest(reqId, {
        status: 'rechazada',
        resolvedAt: new Date().toISOString(),
        response: { rejectionReason: reason }
      });

      _notifications().createNotification(
        pat.dni, 'patient', 'solicitud',
        'Solicitud rechazada',
        `Tu solicitud fue rechazada por el Dr. ${doc.name}. Motivo: ${reason}`,
        reqId
      );

      _app().showToast('Solicitud rechazada', 'warning');
      overlay.remove();
      refreshFn();
    });
  }

  // ── Tab: Turnos ───────────────────────────────────────────────────────────

  function renderTabTurnos(content, doc, pat) {
    const appointments = _storage().getAppointments({ doctorDni: doc.dni, patientDni: pat.dni })
      .sort((a, b) => {
        const cmp = b.date.localeCompare(a.date);
        return cmp !== 0 ? cmp : (b.time || '').localeCompare(a.time || '');
      });

    if (appointments.length === 0) {
      content.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-state-icon">📅</div>
          <p class="empty-state-text">No hay turnos registrados con este paciente.</p>
        </div>`;
      return;
    }

    const today = todayISO();

    function draw() {
      const appts = _storage().getAppointments({ doctorDni: doc.dni, patientDni: pat.dni })
        .sort((a, b) => {
          const cmp = b.date.localeCompare(a.date);
          return cmp !== 0 ? cmp : (b.time || '').localeCompare(a.time || '');
        });

      const html = `
        <div class="stagger-children fade-in">
          ${appts.map(a => {
            const isUpcoming = a.date >= today;
            const isPending  = a.status === 'pendiente' && isUpcoming;
            return `
              <div class="list-item card mb-1">
                <div class="list-item-content flex-between" style="flex-wrap:wrap;gap:.5rem">
                  <div>
                    <strong>${formatDate(a.date)}</strong>
                    <span class="text-muted" style="margin-left:.5rem">${escapeHtml(a.time || '')}</span>
                    ${isUpcoming ? '<span style="margin-left:.5rem;font-size:.75rem;color:var(--color-primary,#3b82f6)">▶ Próximo</span>' : ''}
                  </div>
                  <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
                    <span class="badge ${getStatusBadgeClass(a.status)}">${getStatusLabel(a.status)}</span>
                    ${isPending ? `
                      <button class="btn btn-success turno-confirm" data-id="${a.id}" style="font-size:.8rem;padding:.25rem .6rem">Confirmar</button>
                      <button class="btn btn-danger turno-cancel" data-id="${a.id}" style="font-size:.8rem;padding:.25rem .6rem">Cancelar</button>
                    ` : ''}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`;

      content.innerHTML = html;

      content.querySelectorAll('.turno-confirm').forEach(btn => {
        btn.addEventListener('click', () => {
          _storage().updateAppointment(btn.dataset.id, { status: 'confirmado' });
          _notifications().createNotification(pat.dni, 'patient', 'turno', 'Turno confirmado', `Tu turno del ${formatDate(appts.find(a => a.id === btn.dataset.id)?.date)} fue confirmado por el Dr. ${doc.name}.`, btn.dataset.id);
          _app().showToast('Turno confirmado', 'success');
          draw();
        });
      });

      content.querySelectorAll('.turno-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          _storage().updateAppointment(btn.dataset.id, { status: 'cancelado' });
          _notifications().createNotification(pat.dni, 'patient', 'turno', 'Turno cancelado', `Tu turno fue cancelado por el Dr. ${doc.name}. Podés solicitar uno nuevo.`, btn.dataset.id);
          _app().showToast('Turno cancelado', 'warning');
          draw();
        });
      });
    }

    draw();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderRequests
  // ──────────────────────────────────────────────────────────────────────────

  function renderRequests(container) {
    container.innerHTML = '';
    const doc = currentDoctor();
    if (!doc) return;

    let filterType = 'todas';

    function draw() {
      const allRequests = _storage().getRequests({ doctorDni: doc.dni });
      const pending   = allRequests.filter(r => r.status === 'pendiente' || r.status === 'en_proceso');
      const resolved  = allRequests.filter(r => r.status === 'completada' || r.status === 'rechazada');

      // Filter
      const filtered = filterType === 'todas'
        ? pending
        : pending.filter(r => r.type === filterType);

      const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const resolvedSorted = [...resolved].sort((a, b) => new Date(b.resolvedAt || b.createdAt) - new Date(a.resolvedAt || a.createdAt)).slice(0, 10);

      // Count badges
      const countReceta      = pending.filter(r => r.type === 'receta').length;
      const countDerivacion  = pending.filter(r => r.type === 'derivacion').length;
      const countEstudio     = pending.filter(r => r.type === 'estudio').length;
      const countInternacion = pending.filter(r => r.type === 'internacion').length;

      const html = `
        <div class="page-enter">
          <h1 class="page-title mb-2">📋 Solicitudes Pendientes</h1>

          <div class="tabs mb-2" style="flex-wrap:wrap">
            <button class="tab ${filterType === 'todas' ? 'tab--active' : ''}" data-filter="todas">Todas <span class="badge">${pending.length}</span></button>
            <button class="tab ${filterType === 'receta' ? 'tab--active' : ''}" data-filter="receta">💊 Recetas <span class="badge">${countReceta}</span></button>
            <button class="tab ${filterType === 'derivacion' ? 'tab--active' : ''}" data-filter="derivacion">🔄 Derivaciones <span class="badge">${countDerivacion}</span></button>
            <button class="tab ${filterType === 'estudio' ? 'tab--active' : ''}" data-filter="estudio">🔬 Estudios <span class="badge">${countEstudio}</span></button>
            <button class="tab ${filterType === 'internacion' ? 'tab--active' : ''}" data-filter="internacion">🏥 Internación <span class="badge">${countInternacion}</span></button>
          </div>

          <!-- Pending Requests -->
          ${sorted.length === 0
            ? `<div class="empty-state fade-in">
                 <div class="empty-state-icon">🎉</div>
                 <p class="empty-state-text">No hay solicitudes pendientes${filterType !== 'todas' ? ` de tipo ${getRequestTypeLabel(filterType)}` : ''}.</p>
               </div>`
            : `<div class="stagger-children">${sorted.map(r => {
                const p = patientObj(r.patientDni);
                return `
                  <div class="card mb-2">
                    <div class="card-body">
                      <div class="flex-between mb-1">
                        <div>
                          <span style="font-size:1.3rem;margin-right:.35rem">${getRequestTypeIcon(r.type)}</span>
                          <strong style="font-size:1.05rem">${getRequestTypeLabel(r.type)}</strong>
                        </div>
                        <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
                      </div>

                      <!-- Patient info -->
                      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
                        <div class="avatar">${getInitials(p?.name)}</div>
                        <div>
                          <div style="font-weight:600">${escapeHtml(p?.name || r.patientDni)}</div>
                          <div class="text-muted" style="font-size:.85rem">DNI: ${escapeHtml(p?.dni || r.patientDni)}${p?.obraSocial ? ` · ${escapeHtml(p.obraSocial)}` : ''}${p?.nroAfiliado ? ` · Nro: ${escapeHtml(p.nroAfiliado)}` : ''}</div>
                        </div>
                      </div>

                      <div class="text-muted mb-1" style="font-size:.85rem">${timeAgo(r.createdAt)}</div>
                      ${buildRequestDetailsPreview(r)}
                      ${buildRequestActions(r)}
                    </div>
                  </div>`;
              }).join('')}</div>`
          }

          <!-- Resolved requests -->
          ${resolvedSorted.length > 0 ? `
            <div class="section mt-3">
              <h2 class="section-title">Solicitudes resueltas (últimas 10)</h2>
              <div class="stagger-children">
                ${resolvedSorted.map(r => {
                  const p = patientObj(r.patientDni);
                  return `
                    <div class="card mb-1" style="opacity:.75">
                      <div class="card-body">
                        <div class="flex-between">
                          <div>
                            <span style="margin-right:.25rem">${getRequestTypeIcon(r.type)}</span>
                            <strong>${getRequestTypeLabel(r.type)}</strong>
                            <span class="text-muted" style="margin-left:.5rem">— ${escapeHtml(p?.name || r.patientDni)}</span>
                          </div>
                          <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
                        </div>
                        ${buildResponsePreview(r)}
                      </div>
                    </div>`;
                }).join('')}
              </div>
            </div>` : ''
          }
        </div>`;

      container.innerHTML = html;

      // Tab filters
      container.querySelectorAll('.tab[data-filter]').forEach(t => {
        t.addEventListener('click', () => { filterType = t.dataset.filter; draw(); });
      });

      // Request actions — we need the patient for each request
      container.querySelectorAll('.req-complete-receta').forEach(btn => {
        btn.addEventListener('click', () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          const p = patientObj(req.patientDni);
          if (!p) { _app().showToast('Paciente no encontrado', 'error'); return; }
          showPrescriptionModal(doc, p, req, draw);
        });
      });

      container.querySelectorAll('.req-approve').forEach(btn => {
        btn.addEventListener('click', () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          _storage().updateRequest(req.id, { status: 'completada', resolvedAt: new Date().toISOString() });
          _notifications().createNotification(req.patientDni, 'patient', 'solicitud', 'Solicitud aprobada', `Tu solicitud ha sido aprobada por el Dr. ${doc.name}.`, req.id);
          _app().showToast('Solicitud aprobada', 'success');
          draw();
        });
      });

      container.querySelectorAll('.req-reject').forEach(btn => {
        btn.addEventListener('click', () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          const p = patientObj(req.patientDni);
          if (!p) { _app().showToast('Paciente no encontrado', 'error'); return; }
          showRejectModal(doc, p, req.id, draw);
        });
      });
    }

    draw();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  window.HolaDocDoctor = {
    renderDashboard,
    renderSchedule,
    renderPatients,
    renderPatientDetail,
    renderRequests
  };

})();
