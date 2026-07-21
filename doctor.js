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
    const map = {
      receta: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
      derivacion: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
      estudio: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
      internacion: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
    };
    return map[type] || `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
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

  async function patientName(dni, patientMap = {}) {
    if (patientMap[dni]) return patientMap[dni].name;
    const p = await _storage().getPatient(dni);
    return p ? p.name : dni;
  }

  async function currentDoctor() {
    const u = _storage().getCurrentUser();
    if (!u || u.type !== 'doctor') return null;
    return (await _storage().getDoctor(u.dni)) || u;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderDashboard
  // ──────────────────────────────────────────────────────────────────────────

  async function renderDashboard(container) {
    container.innerHTML = '';
    const doc = await currentDoctor();
    if (!doc) { container.innerHTML = '<p class="text-center mt-3">No se pudo cargar el perfil del médico.</p>'; return; }

    const today        = todayISO();
    const appointments = await _storage().getAppointments({ doctorDni: doc.dni, date: today });
    const allRequests  = await _storage().getRequests({ doctorDni: doc.dni, status: 'pendiente' });
    const allAppts     = await _storage().getAppointments({ doctorDni: doc.dni });
    const allPatients  = await _storage().getPatients();
    const patientMap   = {};
    allPatients.forEach(p => { patientMap[p.dni] = p; });

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
          <h1 class="page-title" style="display:flex;align-items:center;gap:10px;">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
            Hola, Dr./Dra. ${escapeHtml(doc.name)}
          </h1>
          <p class="page-subtitle">${formatDateLong()}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-3 mb-3 stagger-children">
          <div class="card card-3d" style="border-left:4px solid var(--primary); display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:52px;height:52px;background:#EFF6FF;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--primary);flex-shrink:0;">
              <img src="img/icon_turno.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Turnos">
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:800;line-height:1.2;color:#1A1A1A;">${todaySorted.length}</div>
              <div class="text-muted" style="font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Turnos hoy</div>
            </div>
          </div>
          <div class="card card-3d" style="border-left:4px solid var(--warning); display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:52px;height:52px;background:#FFFBEB;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--warning);flex-shrink:0;">
              <img src="img/icon_receta.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Solicitudes">
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:800;line-height:1.2;color:#1A1A1A;">${allRequests.length}</div>
              <div class="text-muted" style="font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Pendientes</div>
            </div>
          </div>
          <div class="card card-3d" style="border-left:4px solid var(--success); display:flex; align-items:center; gap:16px; padding:20px;">
            <div style="width:52px;height:52px;background:#DCFCE7;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--success);flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div style="font-size:1.8rem;font-weight:800;line-height:1.2;color:#1A1A1A;">${patientDnis.size}</div>
              <div class="text-muted" style="font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Pacientes</div>
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
                const pName = patientMap[a.patientDni]?.name || a.patientDni;
                return `
                  <div class="list-item card mb-1">
                    <div class="list-item-content flex-between">
                      <div>
                        <span style="font-weight:700;font-size:1.1rem;margin-right:.5rem">${escapeHtml(a.time || '—')}</span>
                        <a href="javascript:void(0)" class="dash-patient-link" data-dni="${a.patientDni}" style="color:var(--color-primary);cursor:pointer;font-weight:600">
                          ${escapeHtml(pName)}
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
            : `<div class="stagger-children">${recentReqs.map(r => {
                const pName = patientMap[r.patientDni]?.name || r.patientDni;
                return `
                <div class="list-item card mb-1 dash-req-link" data-dni="${r.patientDni}" style="cursor:pointer">
                  <div class="list-item-content flex-between">
                    <div>
                      <span style="margin-right:.35rem">${getRequestTypeIcon(r.type)}</span>
                      <strong>${getRequestTypeLabel(r.type)}</strong>
                      <span class="text-muted" style="margin-left:.5rem">— ${escapeHtml(pName)}</span>
                    </div>
                    <div>
                      <span class="text-muted" style="font-size:.85rem;margin-right:.5rem">${timeAgo(r.createdAt)}</span>
                      <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
                    </div>
                  </div>
                </div>`;
              }).join('')}</div>`
          }
        </div>
      </div>`;

    container.innerHTML = html;

    // Events
    container.querySelectorAll('.dash-patient-link').forEach(link => {
      link.addEventListener('click', () => _app().navigate(`/doctor/paciente/${link.dataset.dni}`));
    });
    container.querySelectorAll('.dash-req-link').forEach(link => {
      link.addEventListener('click', () => _app().navigate(`/doctor/paciente/${link.dataset.dni}/solicitudes`));
    });
    const verTodas = container.querySelector('#dash-ver-todas');
    if (verTodas) verTodas.addEventListener('click', () => _app().navigate('/doctor/solicitudes'));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderSchedule
  // ──────────────────────────────────────────────────────────────────────────

  async function renderSchedule(container) {
    container.innerHTML = '';
    const doc = await currentDoctor();
    if (!doc) { container.innerHTML = '<p class="text-center mt-3">Error al cargar perfil.</p>'; return; }

    let activeTab = 'config';

    async function render() {
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
            <button class="tab ${activeTab === 'blocked' ? 'tab--active' : ''}" data-tab="blocked">🚫 Bloquear Días</button>
          </div>

          <div id="sched-content"></div>
        </div>`;

      container.innerHTML = html;

      container.querySelector('#sched-back').addEventListener('click', () => _app().navigate('/doctor'));
      container.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', () => { activeTab = t.dataset.tab; render(); });
      });

      const content = container.querySelector('#sched-content');
      if (activeTab === 'config') renderScheduleConfig(content, doc, schedule, duration);
      else if (activeTab === 'week') await renderScheduleWeek(content, doc);
      else await renderScheduleBlocked(content, doc);
    }

    await render();
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
    content.querySelector('#sched-save').addEventListener('click', async () => {
      const newSchedule = {};
      DAYS.forEach(day => {
        const active = content.querySelector(`.day-check[data-day="${day.key}"]`).checked;
        const start  = content.querySelector(`.day-start[data-day="${day.key}"]`)?.value || '08:00';
        const end    = content.querySelector(`.day-end[data-day="${day.key}"]`)?.value || '17:00';
        newSchedule[day.key] = { active, start, end };
      });
      const newDuration = parseInt(content.querySelector('#sched-duration').value, 10);

      await _storage().updateDoctor(doc.dni, { schedule: newSchedule, consultationDuration: newDuration });

      // Refresh cached doc
      Object.assign(doc, { schedule: newSchedule, consultationDuration: newDuration });

      _app().showToast('Agenda actualizada correctamente', 'success');
    });
  }

  async function renderScheduleWeek(content, doc) {
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

    const allAppts = await _storage().getAppointments({ doctorDni: doc.dni });
    const allPatients = await _storage().getPatients();
    const patientMap = {};
    allPatients.forEach(p => { patientMap[p.dni] = p; });

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
                    : dayAppts.map(a => {
                        const pName = patientMap[a.patientDni]?.name || a.patientDni;
                        return `
                        <div class="time-slot week-slot" data-dni="${a.patientDni}"
                             style="background:${a.status === 'confirmado' ? 'rgba(16,185,129,.12)' : a.status === 'pendiente' ? 'rgba(245,158,11,.12)' : a.status === 'completado' ? 'rgba(107,114,128,.1)' : 'rgba(239,68,68,.1)'};
                                    border-radius:.5rem;padding:.35rem .5rem;margin-bottom:.35rem;cursor:pointer;font-size:.8rem">
                          <strong>${escapeHtml(a.time || '')}</strong><br/>
                          <span>${escapeHtml(pName.split(' ')[0])}</span>
                        </div>`;
                      }).join('')
                  }
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    content.innerHTML = html;

    content.querySelectorAll('.week-slot').forEach(slot => {
      slot.addEventListener('click', () => _app().navigate(`/doctor/paciente/${slot.dataset.dni}`));
    });
  }

  async function renderScheduleBlocked(content, doc) {
    async function draw() {
      const blockedDates = (await _storage().getBlockedDates(doc.dni)).sort();
      const html = `
        <div class="card card-glass fade-in" style="text-align:left;">
          <div class="card-body">
            <h3 style="margin-bottom:1rem; font-weight:800; font-size: 20px;">🚫 Suspender Agenda / Cancelar Días</h3>
            <p class="text-muted" style="font-size:15px; margin-bottom: 20px;">
              Seleccioná un día específico en el que no vayas a atender. Los pacientes no podrán reservar turnos en esa fecha.
            </p>

            <div class="form-group" style="display:flex; gap: 1rem; align-items: flex-end; margin-bottom: 24px;">
              <div style="flex: 1;">
                <label class="form-label" for="block-date-input">Fecha a bloquear</label>
                <input type="date" id="block-date-input" class="form-input" min="${todayISO()}" />
              </div>
              <button class="btn btn-danger" id="btn-block-date" style="height: 56px; padding: 0 24px;">BLOQUEAR FECHA</button>
            </div>

            <h4 style="font-weight:800; font-size:18px; margin-bottom:12px;">Fechas bloqueadas actualmente:</h4>
            ${blockedDates.length === 0
              ? '<p class="text-muted" style="font-size:16px;">No tenés fechas bloqueadas.</p>'
              : `
                <div style="display:flex; flex-direction:column; gap: 8px;">
                  ${blockedDates.map(date => `
                    <div class="flex-between card" style="padding: 12px 20px; background: rgba(0,0,0,0.01); border-radius: 8px; box-shadow: var(--shadow-sm);">
                      <span style="font-weight: 700; font-size: 17px;">🚫 ${formatDate(date)}</span>
                      <button class="btn btn-outline btn-unlock-date" data-date="${date}" style="height: 38px; padding: 0 16px; border-radius: 8px; color: var(--danger); border-color: var(--danger);">
                        Desbloquear
                      </button>
                    </div>
                  `).join('')}
                </div>
              `
            }
          </div>
        </div>
      `;

      content.innerHTML = html;

      // Add block action
      content.querySelector('#btn-block-date').addEventListener('click', async () => {
        const dateInput = content.querySelector('#block-date-input');
        const dateVal = dateInput.value;
        if (!dateVal) { _app().showToast('Seleccioná una fecha válida', 'error'); return; }

        await _storage().saveBlockedDate(doc.dni, dateVal);
        _app().showToast('Fecha bloqueada con éxito', 'success');
        await draw();
      });

      // Add unblock actions
      content.querySelectorAll('.btn-unlock-date').forEach(btn => {
        btn.addEventListener('click', async () => {
          const dateVal = btn.dataset.date;
          await _storage().removeBlockedDate(doc.dni, dateVal);
          _app().showToast('Fecha desbloqueada', 'info');
          await draw();
        });
      });
    }

    await draw();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderPatients
  // ──────────────────────────────────────────────────────────────────────────

  async function renderPatients(container) {
    container.innerHTML = '';
    const doc = await currentDoctor();
    if (!doc) return;

    const allAppts    = await _storage().getAppointments({ doctorDni: doc.dni });
    const allRequests = await _storage().getRequests({ doctorDni: doc.dni });
    const allPatientsList = await _storage().getPatients();

    // Unique patient DNIs
    const dniSet = new Set();
    allAppts.forEach(a => dniSet.add(a.patientDni));
    allRequests.forEach(r => dniSet.add(r.patientDni));
    
    // Also include patients that have medical records written by this doctor
    for (const p of allPatientsList) {
      const records = await _storage().getRecords(p.dni);
      if (records.some(rec => rec.doctorDni === doc.dni)) {
        dniSet.add(p.dni);
      }
    }

    const patients = allPatientsList.filter(p => dniSet.has(p.dni));

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
        card.addEventListener('click', () => _app().navigate(`/doctor/paciente/${card.dataset.dni}`));
      });
    }

    renderList();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderPatientDetail
  // ──────────────────────────────────────────────────────────────────────────

  async function renderPatientDetail(container, patientDni, defaultTab = 'historia') {
    container.innerHTML = '';
    const doc = await currentDoctor();
    const pat = await _storage().getPatient(patientDni);
    if (!doc || !pat) {
      container.innerHTML = '<p class="text-center mt-3">Paciente no encontrado.</p>';
      return;
    }

    let activeTab = defaultTab;

    async function render() {
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
                <div class="text-muted" style="line-height:1.7;display:flex;flex-direction:column;gap:4px;margin-top:8px;">
                  <span style="display:flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="10" r="3"></circle><path d="M12 13c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"></path></svg> DNI: <strong>${escapeHtml(pat.dni)}</strong></span>
                  <span style="display:flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Obra Social: <strong>${escapeHtml(pat.obraSocial || '—')}</strong> · Nro: <strong>${escapeHtml(pat.nroAfiliado || '—')}</strong></span>
                  <span style="display:flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${escapeHtml(pat.phone || '—')} · 🎂 ${formatDate(pat.birthDate)} (${age} años)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs mb-2">
            <button class="tab ${activeTab === 'historia' ? 'tab--active' : ''}" data-tab="historia" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Historia Clínica</button>
            <button class="tab ${activeTab === 'indicadores' ? 'tab--active' : ''}" data-tab="indicadores" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Indicadores</button>
            <button class="tab ${activeTab === 'solicitudes' ? 'tab--active' : ''}" data-tab="solicitudes" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg> Solicitudes</button>
            <button class="tab ${activeTab === 'turnos' ? 'tab--active' : ''}" data-tab="turnos" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Turnos</button>
          </div>

          <div id="pd-tab-content"></div>
        </div>`;

      container.innerHTML = html;

      container.querySelector('#pd-back').addEventListener('click', () => _app().navigate('/doctor/pacientes'));
      container.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', async () => { activeTab = t.dataset.tab; await render(); });
      });

      const tabContent = container.querySelector('#pd-tab-content');
      switch (activeTab) {
        case 'historia':     await renderTabHistoria(tabContent, doc, pat); break;
        case 'indicadores':  await renderTabIndicadores(tabContent, pat); break;
        case 'solicitudes':  await renderTabSolicitudes(tabContent, doc, pat); break;
        case 'turnos':       await renderTabTurnos(tabContent, doc, pat); break;
      }
    }

    await render();
  }

  // ── Tab: Historia Clínica ─────────────────────────────────────────────────

  async function renderTabHistoria(content, doc, pat) {
    const records = (await _storage().getRecords(pat.dni)).sort((a, b) => new Date(b.date) - new Date(a.date));
    let showForm = false;

    async function draw() {
      const doctorsList = await _storage().getDoctors();
      const docMap = {};
      doctorsList.forEach(d => { docMap[d.dni] = d.name; });

      const html = `
        <div class="fade-in">
          <button class="btn btn-primary mb-2" id="hc-new-entry">+ Nueva Entrada</button>

          ${showForm ? buildRecordForm(doc) : ''}

          ${records.length === 0
            ? '<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">No hay registros en la historia clínica.</p></div>'
            : `<div class="timeline stagger-children">${records.map(r => {
                const drName = docMap[r.doctorDni] || r.doctorDni;
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

      content.querySelector('#hc-new-entry').addEventListener('click', async () => { showForm = !showForm; await draw(); });

      if (showForm) {
        content.querySelector('#hc-save').addEventListener('click', async () => {
          const reason = content.querySelector('#hc-reason').value.trim();
          if (!reason) { _app().showToast('El motivo de consulta es obligatorio', 'error'); return; }

          await _storage().saveRecord({
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
          const updatedRecords = (await _storage().getRecords(pat.dni)).sort((a, b) => new Date(b.date) - new Date(a.date));
          records.length = 0;
          records.push(...updatedRecords);
          await draw();
        });

        content.querySelector('#hc-cancel')?.addEventListener('click', async () => { showForm = false; await draw(); });
      }
    }

    await draw();
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
            <textarea class="form-control" id="hc-reason" rows="4" placeholder="Describa el motivo de la consulta..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Antecedentes patológicos</label>
            <textarea class="form-control" id="hc-pathological" rows="4" placeholder="Antecedentes relevantes..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Antecedentes quirúrgicos</label>
            <textarea class="form-control" id="hc-surgical" rows="4" placeholder="Cirugías previas..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Medicación actual</label>
            <textarea class="form-control" id="hc-medication" rows="4" placeholder="Medicamentos en curso..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Objetivos para próxima consulta</label>
            <textarea class="form-control" id="hc-objectives" rows="4" placeholder="Seguimiento, estudios, etc..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Notas adicionales</label>
            <textarea class="form-control" id="hc-notes" rows="4" placeholder="Cualquier observación adicional..."></textarea>
          </div>
          <button class="btn btn-success btn-lg btn-block" id="hc-save">💾 GUARDAR</button>
        </div>
      </div>`;
  }

  // ── Tab: Indicadores ──────────────────────────────────────────────────────

  async function renderTabIndicadores(content, pat) {
    const data = await _storage().getHealthData(pat.dni, 10);
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

  async function renderTabSolicitudes(content, doc, pat) {
    async function draw() {
      const requests = (await _storage().getRequests({ doctorDni: doc.dni, patientDni: pat.dni }))
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

    await draw();
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
      btn.addEventListener('click', async () => {
        const reqId = btn.dataset.id;
        const requestsList = await _storage().getRequests({ doctorDni: doc.dni });
        const req = requestsList.find(r => r.id === reqId);
        if (!req) return;
        showPrescriptionModal(doc, pat, req, refreshFn);
      });
    });

    // Approve
    scope.querySelectorAll('.req-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reqId = btn.dataset.id;
        await _storage().updateRequest(reqId, { status: 'completada', resolvedAt: new Date().toISOString() });
        await _notifications().createNotification(pat.dni, 'patient', 'solicitud', 'Solicitud aprobada', `Tu solicitud ha sido aprobada por el Dr. ${doc.name}.`, reqId);
        _app().showToast('Solicitud aprobada', 'success');
        await refreshFn();
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

          <button class="btn btn-success btn-lg btn-block" id="presc-emit">📋 CONFIRMAR RECETA</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#presc-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#presc-emit').addEventListener('click', async () => {
      const meds  = overlay.querySelector('#presc-meds').value.trim();
      if (!meds) { _app().showToast('Debe indicar los medicamentos recetados', 'error'); return; }

      const diag  = overlay.querySelector('#presc-diag').value.trim();
      const instr = overlay.querySelector('#presc-instr').value.trim();

      await _storage().updateRequest(req.id, {
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

      const isPami = (pat.obraSocial || '').toUpperCase().includes('PAMI');
      const notifMessage = isPami
        ? `Su receta se realizó con éxito, acerquese a su farmacia de confianza ( para pacientes PAMI de red pami habilitadas )`
        : `Su receta se realizó con éxito. Ya podés ver los detalles e indicaciones en la app.`;

      await _notifications().createNotification(
        pat.dni, 'patient', 'receta',
        'Receta lista con éxito',
        notifMessage,
        req.id
      );

      _app().showToast('Receta confirmada correctamente', 'success');
      overlay.remove();
      await refreshFn();
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

    overlay.querySelector('#reject-confirm').addEventListener('click', async () => {
      const reason = overlay.querySelector('#reject-reason').value.trim();
      if (!reason) { _app().showToast('Debe indicar el motivo del rechazo', 'error'); return; }

      await _storage().updateRequest(reqId, {
        status: 'rechazada',
        resolvedAt: new Date().toISOString(),
        response: { rejectionReason: reason }
      });

      await _notifications().createNotification(
        pat.dni, 'patient', 'solicitud',
        'Solicitud rechazada',
        `Tu solicitud fue rechazada por el Dr. ${doc.name}. Motivo: ${reason}`,
        reqId
      );

      _app().showToast('Solicitud rechazada', 'warning');
      overlay.remove();
      await refreshFn();
    });
  }

  function showCancelAppointmentModal(doc, pat, apptId, dateStr, refreshFn) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal slide-up" style="max-width:450px">
        <div class="modal-header flex-between">
          <h3 style="font-weight:900; font-size:20px; color:var(--primary); margin:0;">❌ Cancelar Turno</h3>
          <button class="modal-close" id="cancel-appt-close">✕</button>
        </div>
        <div class="card-body" style="padding-top:16px;">
          <p style="font-size:16px; margin-bottom:16px; color:var(--text-secondary);">
            ¿Estás seguro de que deseas cancelar el turno de <strong>${escapeHtml(pat.name)}</strong> programado para el día <strong>${dateStr}</strong>?
          </p>
          <div class="form-group">
            <label class="form-label">Motivo de la cancelación *</label>
            <textarea class="form-textarea" id="cancel-appt-reason" rows="3" placeholder="Ej: Superposición horaria / Congresos médicos..." required></textarea>
          </div>
          <button class="btn btn-danger btn-lg btn-block" id="cancel-appt-confirm">CANCELAR TURNO</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#cancel-appt-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#cancel-appt-confirm').addEventListener('click', async () => {
      const reason = overlay.querySelector('#cancel-appt-reason').value.trim();
      if (!reason) { _app().showToast('Debe indicar el motivo de la cancelación', 'error'); return; }

      await _storage().updateAppointment(apptId, {
        status: 'cancelado',
        cancelReason: reason
      });

      await _notifications().createNotification(
        pat.dni, 'patient', 'turno',
        'Turno cancelado',
        `Tu turno del ${dateStr} fue cancelado por el Dr. ${doc.name}. Motivo: ${reason}`,
        apptId
      );

      _app().showToast('Turno cancelado correctamente', 'warning');
      overlay.remove();
      await refreshFn();
    });
  }

  // ── Tab: Turnos ───────────────────────────────────────────────────────────

  async function renderTabTurnos(content, doc, pat) {
    const today = todayISO();

    async function draw() {
      const appts = (await _storage().getAppointments({ doctorDni: doc.dni, patientDni: pat.dni }))
        .sort((a, b) => {
          const cmp = b.date.localeCompare(a.date);
          return cmp !== 0 ? cmp : (b.time || '').localeCompare(a.time || '');
        });

      if (appts.length === 0) {
        content.innerHTML = `
          <div class="empty-state fade-in">
            <div class="empty-state-icon">📅</div>
            <p class="empty-state-text">No hay turnos registrados con este paciente.</p>
          </div>`;
        return;
      }

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
        btn.addEventListener('click', async () => {
          await _storage().updateAppointment(btn.dataset.id, { status: 'confirmado' });
          await _notifications().createNotification(pat.dni, 'patient', 'turno', 'Turno confirmado', `Tu turno del ${formatDate(appts.find(a => a.id === btn.dataset.id)?.date)} fue confirmado por el Dr. ${doc.name}.`, btn.dataset.id);
          _app().showToast('Turno confirmado', 'success');
          await draw();
        });
      });

      content.querySelectorAll('.turno-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          const appt = appts.find(a => a.id === btn.dataset.id);
          const dateStr = formatDate(appt?.date);
          showCancelAppointmentModal(doc, pat, btn.dataset.id, dateStr, draw);
        });
      });
    }

    await draw();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // renderRequests
  // ──────────────────────────────────────────────────────────────────────────

  async function renderRequests(container) {
    container.innerHTML = '';
    const doc = await currentDoctor();
    if (!doc) return;

    let filterType = 'todas';

    async function draw() {
      const allRequests = await _storage().getRequests({ doctorDni: doc.dni });
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

      const allPatientsList = await _storage().getPatients();
      const patientMap = {};
      allPatientsList.forEach(p => { patientMap[p.dni] = p; });

      const html = `
        <div class="page-enter">
          <h1 class="page-title mb-2" style="display:flex;align-items:center;gap:10px;">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Solicitudes Pendientes
          </h1>

          <div class="tabs mb-2" style="flex-wrap:wrap">
            <button class="tab ${filterType === 'todas' ? 'tab--active' : ''}" data-filter="todas" style="display:inline-flex;align-items:center;gap:6px;">Todas <span class="badge">${pending.length}</span></button>
            <button class="tab ${filterType === 'receta' ? 'tab--active' : ''}" data-filter="receta" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Recetas <span class="badge">${countReceta}</span></button>
            <button class="tab ${filterType === 'derivacion' ? 'tab--active' : ''}" data-filter="derivacion" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Derivaciones <span class="badge">${countDerivacion}</span></button>
            <button class="tab ${filterType === 'estudio' ? 'tab--active' : ''}" data-filter="estudio" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Estudios <span class="badge">${countEstudio}</span></button>
            <button class="tab ${filterType === 'internacion' ? 'tab--active' : ''}" data-filter="internacion" style="display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Internación <span class="badge">${countInternacion}</span></button>
          </div>

          <!-- Pending Requests -->
          ${sorted.length === 0
            ? `<div class="empty-state fade-in">
                 <div class="empty-state-icon">🎉</div>
                 <p class="empty-state-text">No hay solicitudes pendientes${filterType !== 'todas' ? ` de tipo ${getRequestTypeLabel(filterType)}` : ''}.</p>
               </div>`
            : `<div class="stagger-children">${sorted.map(r => {
                const p = patientMap[r.patientDni];
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
                  const p = patientMap[r.patientDni];
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
        t.addEventListener('click', async () => { filterType = t.dataset.filter; await draw(); });
      });

      // Request actions — we need the patient for each request
      container.querySelectorAll('.req-complete-receta').forEach(btn => {
        btn.addEventListener('click', () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          const p = patientMap[req.patientDni];
          if (!p) { _app().showToast('Paciente no encontrado', 'error'); return; }
          showPrescriptionModal(doc, p, req, draw);
        });
      });

      container.querySelectorAll('.req-approve').forEach(btn => {
        btn.addEventListener('click', async () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          await _storage().updateRequest(req.id, { status: 'completada', resolvedAt: new Date().toISOString() });
          await _notifications().createNotification(req.patientDni, 'patient', 'solicitud', 'Solicitud aprobada', `Tu solicitud ha sido aprobada por el Dr. ${doc.name}.`, req.id);
          _app().showToast('Solicitud aprobada', 'success');
          await draw();
        });
      });

      container.querySelectorAll('.req-reject').forEach(btn => {
        btn.addEventListener('click', () => {
          const req = allRequests.find(r => r.id === btn.dataset.id);
          if (!req) return;
          const p = patientMap[req.patientDni];
          if (!p) { _app().showToast('Paciente no encontrado', 'error'); return; }
          showRejectModal(doc, p, req.id, draw);
        });
      });
    }

    await draw();
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
