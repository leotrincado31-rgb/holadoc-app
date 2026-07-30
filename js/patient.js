/**
 * HolaDoc! — Patient Module
 * Handles all patient-side rendering and actions.
 */
(function() {
    'use strict';

    const SPECIALTIES = ['Clínica Médica','Cardiología','Dermatología','Endocrinología','Gastroenterología','Ginecología','Nefrología','Neumonología','Neurología','Oftalmología','Otorrinolaringología','Pediatría','Psiquiatría','Traumatología','Urología'];

    const DAYS_SPANISH = {
        'lunes': 'Lunes',
        'martes': 'Martes',
        'miercoles': 'Miércoles',
        'jueves': 'Jueves',
        'viernes': 'Viernes',
        'sabado': 'Sábado',
        'domingo': 'Domingo'
    };

    window.HolaDocPatient = {
        async renderDashboard(container) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const requests = (await window.HolaDocStorage.getRequests({ patientDni: user.dni })).slice(0, 5);

            container.innerHTML = `
                <div class="page-enter">
                    <div class="page-header" style="text-align: left; margin-bottom: 32px;">
                        <h1 class="page-title" style="font-size:32px;">Hola, ${user.name.split(' ')[0]} 👋</h1>
                        <p class="page-subtitle" style="font-size: 19px;">¿Qué necesitás hoy de tu médico?</p>
                    </div>

                    <!-- Quick Actions Grid -->
                    <div class="grid grid-3" style="margin-bottom: 40px;">
                        <a href="#/patient/turno" class="action-card action-card--turno">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_turno.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Turno"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Solicitar Turno</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Reservá día y horario.</div>
                        </a>
                        <a href="#/patient/receta" class="action-card action-card--receta">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_receta.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Receta"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Pedir Receta</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Recibí tu receta digital.</div>
                        </a>
                        <a href="#/patient/derivacion" class="action-card action-card--derivacion">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_derivacion.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Derivacion"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Derivación</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Pedí pase a especialista.</div>
                        </a>
                        <a href="#/patient/estudio" class="action-card action-card--estudio">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_estudio.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Estudio"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Estudios</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Radiografías, análisis, etc.</div>
                        </a>
                        <a href="#/patient/internacion" class="action-card action-card--internacion">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_internacion.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Internacion"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Internación Domic.</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Atención en tu hogar.</div>
                        </a>
                        <a href="#/patient/salud" class="action-card action-card--salud">
                            <div class="action-icon" style="padding:0; background:transparent;"><img src="img/icon_salud.png" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply;" alt="Salud"></div>
                            <div style="font-weight: 800; font-size: 19px; margin-top:8px;">Mi Salud</div>
                            <div class="text-muted" style="font-size:14px; margin-top:4px;">Presión, peso y glucemia.</div>
                        </a>
                    </div>

                    <!-- Recent Requests -->
                    <div class="section">
                        <h2 class="section-title">⌛ Mis Solicitudes Recientes</h2>
                        ${requests.length === 0 ? `
                            <div class="card text-center" style="padding: 32px 16px;">
                                <p class="text-muted">Todavía no realizaste ninguna solicitud. Elegí una acción de arriba para empezar.</p>
                            </div>
                        ` : `
                            <div class="card" style="padding: 0; overflow: hidden;">
                                ${(await Promise.all(requests.map(async r => {
                                    let icon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;color:var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
                                    let typeName = 'Solicitud';
                                    if (r.type === 'receta') { 
                                        icon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;color:var(--primary);"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`; 
                                        typeName = 'Receta Médica'; 
                                    }
                                    else if (r.type === 'derivacion') { 
                                        icon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;color:var(--primary);"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`; 
                                        typeName = 'Derivación'; 
                                    }
                                    else if (r.type === 'estudio') { 
                                        icon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;color:var(--primary);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`; 
                                        typeName = 'Estudio de Imagen/Lab'; 
                                    }
                                    else if (r.type === 'internacion') { 
                                        icon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;color:var(--primary);"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`; 
                                        typeName = 'Internación Domiciliaria'; 
                                    }

                                    const doc = await window.HolaDocStorage.getDoctor(r.doctorDni);
                                    const docName = doc ? doc.name : 'Médico General';
                                    const dateStr = new Date(r.createdAt).toLocaleDateString('es-AR');

                                    return `
                                        <a href="#/patient/solicitud/${r.id}" class="list-item" style="text-decoration:none; color:inherit; border-bottom:1px solid var(--bg-secondary); padding: 16px 20px; display:flex; align-items:center; gap:12px;">
                                            <span>${icon}</span>
                                            <div class="list-item-content">
                                                <div class="list-item-title" style="font-size:18px; font-weight:700;">${typeName}</div>
                                                <div class="list-item-subtitle" style="font-size:15px; color:var(--text-secondary); margin-top:2px;">${docName} — ${dateStr}</div>
                                            </div>
                                            <span class="badge badge-${r.status}">
                                                ${r.status === 'pendiente' ? 'Pendiente' : ''}
                                                ${r.status === 'en_proceso' ? 'En Proceso' : ''}
                                                ${r.status === 'completada' ? 'Listo' : ''}
                                                ${r.status === 'rechazada' ? 'Rechazado' : ''}
                                            </span>
                                        </a>
                                    `;
                                }))).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        async renderAppointment(container) {
            const doctors = await window.HolaDocStorage.getDoctors();
            let selectedDoctor = null;
            let selectedDate = null;
            let selectedTime = null;

            function renderStep1() {
                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header">
                            <a href="#/patient" class="page-back">← Cancelar</a>
                            <h1 class="page-title">Solicitar Turno</h1>
                            <p class="page-subtitle">Paso 1: Seleccioná tu médico</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="filter-specialty">Filtrar por Especialidad</label>
                            <select id="filter-specialty" class="form-select">
                                <option value="all">Todas las especialidades</option>
                                ${SPECIALTIES.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>

                        <div class="grid grid-auto mt-2" id="doctors-list">
                            ${renderDoctors(doctors)}
                        </div>
                    </div>
                `;

                // Add filter listener
                document.getElementById('filter-specialty').addEventListener('change', (e) => {
                    const spec = e.target.value;
                    const filtered = spec === 'all' ? doctors : doctors.filter(d => d.specialty === spec);
                    document.getElementById('doctors-list').innerHTML = renderDoctors(filtered);
                    attachDoctorSelectionListeners(filtered);
                });

                attachDoctorSelectionListeners(doctors);
            }

            function renderDoctors(docList) {
                if (docList.length === 0) {
                    return `<div class="card text-center" style="grid-column: 1/-1;"><p class="text-muted">No se encontraron médicos de esa especialidad.</p></div>`;
                }
                return docList.map(d => {
                    // Extract active schedule days
                    const days = Object.keys(d.schedule).filter(k => d.schedule[k].active).map(k => DAYS_SPANISH[k]).join(', ');
                    return `
                        <div class="card card-3d select-doctor-btn" data-dni="${d.dni}" style="cursor:pointer; text-align:left;">
                            <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
                                <div class="avatar avatar-lg">${window.HolaDocApp.getInitials(d.name)}</div>
                                <div>
                                    <h3 style="font-weight:800; font-size:19px; margin:0;">${d.name}</h3>
                                    <p style="color:var(--primary); font-weight:700; font-size:16px; margin:4px 0 0 0;">${d.specialty}</p>
                                </div>
                            </div>
                            <p class="text-muted" style="font-size:15px; margin:0;"><b>Días de atención:</b> ${days || 'No configurado'}</p>
                            <p class="text-muted" style="font-size:15px; margin:4px 0 0 0;"><b>Duración:</b> ${d.consultationDuration} min por consulta.</p>
                        </div>
                    `;
                }).join('');
            }

            function attachDoctorSelectionListeners(docList) {
                const btns = container.querySelectorAll('.select-doctor-btn');
                btns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const dni = btn.getAttribute('data-dni');
                        selectedDoctor = docList.find(d => d.dni === dni);
                        renderStep2();
                    });
                });
            }

            function renderStep2() {
                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header">
                            <button class="page-back" id="btn-back-step1" style="background:transparent; border:none; font-family:inherit;">← Volver al Paso 1</button>
                            <h1 class="page-title">Solicitar Turno</h1>
                            <p class="page-subtitle">Paso 2: Elegí el día de atención para ${selectedDoctor.name}</p>
                        </div>

                        <div class="card" style="padding: 24px;">
                            <div class="form-group">
                                <label class="form-label" for="appointment-date">Seleccioná una fecha</label>
                                <input type="date" id="appointment-date" class="form-input" required min="${new Date().toISOString().split('T')[0]}">
                                <div class="form-error hidden" id="date-error"></div>
                            </div>
                            <button id="btn-next-step3" class="btn btn-primary btn-lg btn-block mt-2">VER HORARIOS DISPONIBLES</button>
                        </div>
                    </div>
                `;

                document.getElementById('btn-back-step1').addEventListener('click', renderStep1);

                document.getElementById('btn-next-step3').addEventListener('click', async () => {
                    const dateInput = document.getElementById('appointment-date');
                    const errorDiv = document.getElementById('date-error');
                    const dateVal = dateInput.value;

                    if (!dateVal) {
                        errorDiv.textContent = 'Por favor seleccioná una fecha.';
                        errorDiv.classList.remove('hidden');
                        return;
                    }

                    // Check if doctor works on that day of week
                    const [year, month, day] = dateVal.split('-');
                    const localDate = new Date(year, month - 1, day);
                    const dayOfWeek = localDate.getDay(); // 0 is Sunday, 1 is Monday...
                    const dayKeys = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
                    const dayKey = dayKeys[dayOfWeek];
                    const worksToday = selectedDoctor.schedule[dayKey] && selectedDoctor.schedule[dayKey].active;

                    if (!worksToday) {
                        errorDiv.textContent = `${selectedDoctor.name} no atiende los días ${DAYS_SPANISH[dayKey]}.`;
                        errorDiv.classList.remove('hidden');
                        return;
                    }

                    // Check if the specific date is blocked by the doctor
                    const blockedDates = await window.HolaDocStorage.getBlockedDates(selectedDoctor.dni);
                    if (blockedDates.includes(dateVal)) {
                        errorDiv.textContent = `${selectedDoctor.name} no atenderá en esta fecha específica (agenda cancelada/bloqueada). Por favor, seleccioná otra fecha.`;
                        errorDiv.classList.remove('hidden');
                        return;
                    }

                    selectedDate = dateVal;
                    await renderStep3(dayKey);
                });
            }

            async function renderStep3(dayKey) {
                const schedule = selectedDoctor.schedule[dayKey];
                const duration = parseInt(selectedDoctor.consultationDuration) || 30;

                // Calculate all time slots
                const slots = [];
                const [startH, startM] = schedule.start.split(':').map(Number);
                const [endH, endM] = schedule.end.split(':').map(Number);

                let current = new Date();
                current.setHours(startH, startM, 0, 0);

                const endTime = new Date();
                endTime.setHours(endH, endM, 0, 0);

                // Get existing appointments for that doctor and date
                const existing = await window.HolaDocStorage.getAppointments({
                    doctorDni: selectedDoctor.dni,
                    date: selectedDate
                });

                while (current < endTime) {
                    const timeStr = current.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const isTaken = existing.some(a => a.time === timeStr && a.status !== 'cancelado');
                    slots.push({ time: timeStr, isTaken });
                    current.setMinutes(current.getMinutes() + duration);
                }

                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header">
                            <button class="page-back" id="btn-back-step2" style="background:transparent; border:none; font-family:inherit;">← Volver al Paso 2</button>
                            <h1 class="page-title">Solicitar Turno</h1>
                            <p class="page-subtitle">Paso 3: Elegí el horario para el ${selectedDate.split('-').reverse().join('/')}</p>
                        </div>

                        <div class="grid grid-auto mt-2" style="gap:12px;">
                            ${slots.map(s => `
                                <div class="time-slot ${s.isTaken ? 'time-slot--taken' : 'select-time-btn'}" data-time="${s.time}">
                                    ${s.time}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                document.getElementById('btn-back-step2').addEventListener('click', renderStep2);

                const timeBtns = container.querySelectorAll('.select-time-btn');
                timeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        selectedTime = btn.getAttribute('data-time');
                        renderStep4();
                    });
                });
            }

            function renderStep4() {
                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header">
                            <h1 class="page-title">Confirmar Turno</h1>
                            <p class="page-subtitle">Paso 4: Verificá los datos del turno</p>
                        </div>

                        <div class="card card-glass text-center" style="padding:32px 24px; margin-bottom:24px;">
                            <div style="font-size:64px; margin-bottom:16px;">📅</div>
                            <h2 style="font-weight:900; color:var(--primary); font-size:24px; margin-bottom:16px;">Detalle de la Reserva</h2>
                            
                            <div style="text-align:left; border-top:1px solid var(--bg-secondary); padding-top:16px;">
                                <p style="font-size:18px; margin: 8px 0;"><b>Médico:</b> ${selectedDoctor.name}</p>
                                <p style="font-size:18px; margin: 8px 0;"><b>Especialidad:</b> ${selectedDoctor.specialty}</p>
                                <p style="font-size:18px; margin: 8px 0;"><b>Fecha:</b> ${selectedDate.split('-').reverse().join('/')}</p>
                                <p style="font-size:18px; margin: 8px 0;"><b>Horario:</b> ${selectedTime} hs</p>
                            </div>
                        </div>

                        <button id="btn-confirm-appointment" class="btn btn-primary btn-lg btn-block">CONFIRMAR TURNO</button>
                        <a href="#/patient" class="btn btn-outline btn-lg btn-block mt-2">CANCELAR</a>
                    </div>
                `;

                document.getElementById('btn-confirm-appointment').addEventListener('click', async () => {
                    const user = window.HolaDocStorage.getCurrentUser();
                    await window.HolaDocStorage.saveAppointment({
                        patientDni: user.dni,
                        doctorDni: selectedDoctor.dni,
                        date: selectedDate,
                        time: selectedTime,
                        status: 'pendiente'
                    });

                    // Notify doctor
                    window.HolaDocNotifications.createNotification(
                        selectedDoctor.dni,
                        'doctor',
                        'info',
                        'Nuevo turno programado',
                        `El paciente ${user.name} reservó un turno para el día ${selectedDate.split('-').reverse().join('/')} a las ${selectedTime} hs.`
                    );

                    window.HolaDocApp.showToast('¡Turno solicitado correctamente!', 'success');
                    window.HolaDocApp.navigate('/patient');
                });
            }

            renderStep1();
        },

        async renderRequest(container, type) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const doctors = await window.HolaDocStorage.getDoctors();
            let formHTML = '';
            let title = '';
            let subtitle = '';

            if (type === 'receta') {
                title = 'Solicitar Receta Digital';
                subtitle = 'Completá los datos y medicamentos que necesitás';
                formHTML = `
                    <div class="card mb-3" style="background:#EBF8FF; border-left: 6px solid var(--primary); text-align:left;">
                        <h3 style="font-weight:800; font-size:18px; margin:0 0 8px 0; color:var(--primary);">Tus datos registrados</h3>
                        <p style="margin:4px 0; font-size:16px;"><b>Nombre:</b> ${user.name}</p>
                        <p style="margin:4px 0; font-size:16px;"><b>DNI:</b> ${user.dni}</p>
                        <p style="margin:4px 0; font-size:16px;"><b>Obra Social/Prepaga:</b> ${user.obraSocial}</p>
                        <p style="margin:4px 0; font-size:16px;"><b>Nro Afiliado:</b> ${user.nroAfiliado}</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-doc">Médico</label>
                        <select id="req-doc" class="form-select" required>
                            <option value="" disabled selected>Seleccioná al médico</option>
                            ${doctors.map(d => `<option value="${d.dni}">${d.name} (${d.specialty})</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-meds">Medicamentos y dosis que necesitás</label>
                        <textarea id="req-meds" class="form-textarea" placeholder="Ej: Losartan 50mg - 1 caja de 30 comp. / Levotiroxina 100mcg - 1 caja" required></textarea>
                    </div>
                `;
            } else if (type === 'derivacion') {
                title = 'Solicitar Derivación';
                subtitle = 'Solicitá una derivación para interconsulta médica';
                formHTML = `
                    <div class="form-group">
                        <label class="form-label" for="req-doc">Médico de cabecera</label>
                        <select id="req-doc" class="form-select" required>
                            <option value="" disabled selected>Seleccioná al médico</option>
                            ${doctors.map(d => `<option value="${d.dni}">${d.name} (${d.specialty})</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-specialty">Especialidad a derivar</label>
                        <select id="req-specialty" class="form-select" required>
                            <option value="" disabled selected>Seleccioná especialidad destino</option>
                            ${SPECIALTIES.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-reason">Motivo de la derivación</label>
                        <textarea id="req-reason" class="form-textarea" placeholder="Ej: Control de marcapasos / Consulta por dolor articular persistente" required></textarea>
                    </div>
                `;
            } else if (type === 'estudio') {
                title = 'Solicitar Estudios';
                subtitle = 'Solicitá órdenes para exámenes de laboratorio o imágenes';
                formHTML = `
                    <div class="form-group">
                        <label class="form-label" for="req-doc">Médico</label>
                        <select id="req-doc" class="form-select" required>
                            <option value="" disabled selected>Seleccioná al médico</option>
                            ${doctors.map(d => `<option value="${d.dni}">${d.name} (${d.specialty})</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-study-type">Tipo de estudio</label>
                        <select id="req-study-type" class="form-select" required>
                            <option value="" disabled selected>Seleccioná tipo</option>
                            <option value="Laboratorio">Análisis de Sangre / Laboratorio</option>
                            <option value="Radiografía">Radiografía (Rayos X)</option>
                            <option value="Ecografía">Ecografía</option>
                            <option value="Tomografía">Tomografía Computada (TC)</option>
                            <option value="Resonancia">Resonancia Magnética (RMN)</option>
                            <option value="Otro">Otro Estudio</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-details">Detalles o zona del cuerpo</label>
                        <input type="text" id="req-details" class="form-input" placeholder="Ej: Ecografía abdominal / Análisis de rutina" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-reason">Motivo clínico</label>
                        <textarea id="req-reason" class="form-textarea" placeholder="Ej: Control semestral de tiroides / Dolor agudo lumbar" required></textarea>
                    </div>
                `;
            } else if (type === 'internacion') {
                title = 'Solicitar Internación Domiciliaria';
                subtitle = 'Solicitud de asistencia de enfermería o kinesiología domiciliaria';
                formHTML = `
                    <div class="form-group">
                        <label class="form-label" for="req-doc">Médico responsable</label>
                        <select id="req-doc" class="form-select" required>
                            <option value="" disabled selected>Seleccioná al médico</option>
                            ${doctors.map(d => `<option value="${d.dni}">${d.name} (${d.specialty})</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-address">Dirección del domicilio</label>
                        <input type="text" id="req-address" class="form-input" placeholder="Ej: Av. Rivadavia 1234, 4to B" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="req-reason">Motivo de la internación / Cuidados necesarios</label>
                        <textarea id="req-reason" class="form-textarea" placeholder="Ej: Tratamiento antibiótico endovenoso diario / Kinesiología respiratoria post-alta" required></textarea>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="page-enter">
                    <div class="page-header">
                        <a href="#/patient" class="page-back">← Volver</a>
                        <h1 class="page-title">${title}</h1>
                        <p class="page-subtitle">${subtitle}</p>
                    </div>

                    <form id="patient-request-form" class="card">
                        ${formHTML}
                        <button type="submit" class="btn btn-primary btn-lg btn-block mt-3">ENVIAR SOLICITUD PENDIENTE</button>
                    </form>
                </div>
            `;

            const form = document.getElementById('patient-request-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const docDni = document.getElementById('req-doc').value;
                const details = {};

                if (type === 'receta') {
                    details.medications = document.getElementById('req-meds').value.trim();
                } else if (type === 'derivacion') {
                    details.specialty = document.getElementById('req-specialty').value;
                    details.reason = document.getElementById('req-reason').value.trim();
                } else if (type === 'estudio') {
                    details.studyType = document.getElementById('req-study-type').value;
                    details.details = document.getElementById('req-details').value.trim();
                    details.reason = document.getElementById('req-reason').value.trim();
                } else if (type === 'internacion') {
                    details.address = document.getElementById('req-address').value.trim();
                    details.reason = document.getElementById('req-reason').value.trim();
                }

                await window.HolaDocStorage.saveRequest({
                    patientDni: user.dni,
                    doctorDni: docDni,
                    type,
                    status: 'pendiente',
                    details
                });

                // Notify doctor
                const doctor = await window.HolaDocStorage.getDoctor(docDni);
                const reqLabel = type === 'receta' ? 'receta' : type === 'derivacion' ? 'derivación' : type === 'estudio' ? 'estudios' : 'internación domiciliaria';
                window.HolaDocNotifications.createNotification(
                    docDni,
                    'doctor',
                    'warning',
                    `Nueva solicitud de ${reqLabel}`,
                    `El paciente ${user.name} envió una solicitud pendiente de tipo ${reqLabel}.`
                );

                window.HolaDocApp.showToast('¡Solicitud enviada correctamente!', 'success');
                window.HolaDocApp.navigate('/patient');
            });
        },

        async renderHealth(container) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const healthDataList = await window.HolaDocStorage.getHealthData(user.dni);
            const records = await window.HolaDocStorage.getRecords(user.dni);

            container.innerHTML = `
                <div class="page-enter">
                    <div class="page-header">
                        <a href="#/patient" class="page-back">← Volver</a>
                        <h1 class="page-title">Mi Salud Diaria</h1>
                        <p class="page-subtitle">Registrá y hacé el seguimiento de tus indicadores de salud</p>
                    </div>

                    <!-- New Reading Card -->
                    <form id="health-form" class="card mb-3" style="text-align:left;">
                        <h2 style="font-weight:900; font-size:20px; color:var(--primary); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                            <span>✍️</span> Nuevo Registro Diario
                        </h2>

                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label">Presión Sistólica (Alta)</label>
                                <input type="number" id="h-sys" class="form-input" placeholder="Ej: 120" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Presión Diastólica (Baja)</label>
                                <input type="number" id="h-dia" class="form-input" placeholder="Ej: 80" required>
                            </div>
                        </div>

                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label">Glucemia (Azúcar en sangre)</label>
                                <input type="number" id="h-glucose" class="form-input" placeholder="Ej: 110 mg/dl">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Peso (kg)</label>
                                <input type="number" id="h-weight" step="0.1" class="form-input" placeholder="Ej: 75.5">
                            </div>
                        </div>

                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label">Temperatura (°C)</label>
                                <input type="number" id="h-temp" step="0.1" class="form-input" placeholder="Ej: 36.5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Frecuencia Cardíaca (lpm)</label>
                                <input type="number" id="h-hr" class="form-input" placeholder="Ej: 72">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Notas o cómo te sentís hoy</label>
                            <input type="text" id="h-notes" class="form-input" placeholder="Ej: Me dolió un poco la cabeza por la tarde">
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg btn-block mt-1">GUARDAR REGISTRO DIARIO</button>
                    </form>

                    <!-- History list -->
                    <div class="section">
                        <h2 class="section-title">📊 Historial de Registros</h2>
                        ${healthDataList.length === 0 ? `
                            <div class="card text-center"><p class="text-muted">No hay registros cargados todavía.</p></div>
                        ` : `
                            <div class="grid" style="gap:16px;">
                                ${healthDataList.map(h => {
                                    // Check status colors
                                    const bpSys = parseInt(h.bloodPressureSys);
                                    const bpDia = parseInt(h.bloodPressureDia);
                                    const isBpHigh = bpSys > 140 || bpDia > 90;
                                    const isGlucoseHigh = h.glucose && parseInt(h.glucose) > 140;

                                    return `
                                        <div class="card card-glass" style="padding:20px; text-align:left; border-left: 6px solid ${isBpHigh || isGlucoseHigh ? 'var(--danger)' : 'var(--accent)'};">
                                            <div style="font-weight:800; font-size:18px; color:var(--text-primary); margin-bottom:12px;">
                                                📅 ${new Date(h.date).toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'})}
                                            </div>
                                            <div class="grid grid-3" style="gap:12px;">
                                                <div>
                                                    <span style="font-size:14px; color:var(--text-muted); font-weight:700;">Presión</span>
                                                    <div style="font-size:19px; font-weight:800; color:${isBpHigh ? 'var(--danger)' : 'var(--text-primary)'}">${h.bloodPressureSys}/${h.bloodPressureDia} <span style="font-size:13px; font-weight:600;">mmHg</span></div>
                                                </div>
                                                ${h.glucose ? `
                                                    <div>
                                                        <span style="font-size:14px; color:var(--text-muted); font-weight:700;">Glucemia</span>
                                                        <div style="font-size:19px; font-weight:800; color:${isGlucoseHigh ? 'var(--danger)' : 'var(--text-primary)'}">${h.glucose} <span style="font-size:13px; font-weight:600;">mg/dl</span></div>
                                                    </div>
                                                ` : ''}
                                                ${h.weight ? `
                                                    <div>
                                                        <span style="font-size:14px; color:var(--text-muted); font-weight:700;">Peso</span>
                                                        <div style="font-size:19px; font-weight:800;">${h.weight} <span style="font-size:13px; font-weight:600;">kg</span></div>
                                                    </div>
                                                ` : ''}
                                                ${h.temperature ? `
                                                    <div>
                                                        <span style="font-size:14px; color:var(--text-muted); font-weight:700;">Temp</span>
                                                        <div style="font-size:19px; font-weight:800;">${h.temperature} <span style="font-size:13px; font-weight:600;">°C</span></div>
                                                    </div>
                                                ` : ''}
                                                ${h.heartRate ? `
                                                    <div>
                                                        <span style="font-size:14px; color:var(--text-muted); font-weight:700;">Pulso</span>
                                                        <div style="font-size:19px; font-weight:800;">${h.heartRate} <span style="font-size:13px; font-weight:600;">lpm</span></div>
                                                    </div>
                                                ` : ''}
                                            </div>
                                            ${h.notes ? `<div style="margin-top:12px; font-size:15px; background:rgba(0,0,0,0.02); padding:8px 12px; border-radius:6px; color:var(--text-secondary);">💬 <b>Notas:</b> ${h.notes}</div>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>

                    <!-- Historia Clínica Section -->
                    <div class="section mt-3">
                        <h2 class="section-title">📋 Mi Historia Clínica</h2>
                        ${records.length === 0 ? `
                            <div class="card text-center"><p class="text-muted">Aún no tenés consultas médicas registradas en tu historia clínica.</p></div>
                        ` : `
                            <div class="timeline">
                                ${(await Promise.all(records.map(async r => {
                                    const doc = await window.HolaDocStorage.getDoctor(r.doctorDni);
                                    const docName = doc ? doc.name : 'Médico General';
                                    return `
                                        <div class="timeline-item">
                                            <div class="timeline-date">${new Date(r.date).toLocaleDateString('es-AR', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                                            <div class="card" style="text-align:left; margin-top:8px;">
                                                <h3 style="font-weight:800; font-size:18px; margin:0 0 12px 0; color:var(--primary);">Atendido por: ${docName}</h3>
                                                
                                                <div style="margin-top:12px; margin-bottom:8px;">
                                                    <b style="font-size:16px;">📋 Motivo de Consulta:</b>
                                                    <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.reason}</p>
                                                </div>

                                                ${r.pathologicalHistory ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🏥 Antecedentes Patológicos:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.pathologicalHistory}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.surgicalHistory ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🔪 Antecedentes Quirúrgicos:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.surgicalHistory}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.currentMedication ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">💊 Medicación Actual:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.currentMedication}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.nextObjectives ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🎯 Objetivos para próxima consulta:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.nextObjectives}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.notes ? `
                                                    <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--bg-secondary);">
                                                        <b style="font-size:16px;">📝 Indicaciones/Notas Médicas:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.notes}</p>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }))).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;

            const form = document.getElementById('health-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const sys = document.getElementById('h-sys').value;
                const dia = document.getElementById('h-dia').value;
                const glucose = document.getElementById('h-glucose').value;
                const weight = document.getElementById('h-weight').value;
                const temp = document.getElementById('h-temp').value;
                const hr = document.getElementById('h-hr').value;
                const notes = document.getElementById('h-notes').value.trim();

                await window.HolaDocStorage.saveHealthData({
                    patientDni: user.dni,
                    date: new Date().toISOString().split('T')[0],
                    bloodPressureSys: parseInt(sys),
                    bloodPressureDia: parseInt(dia),
                    glucose: glucose ? parseInt(glucose) : null,
                    weight: weight ? parseFloat(weight) : null,
                    temperature: temp ? parseFloat(temp) : null,
                    heartRate: hr ? parseInt(hr) : null,
                    notes
                });

                window.HolaDocApp.showToast('¡Registro de salud diario guardado!', 'success');
                this.renderHealth(container);
            });
        },

        async renderHistory(container) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const records = await window.HolaDocStorage.getRecords(user.dni);
            const requests = await window.HolaDocStorage.getRequests({ patientDni: user.dni });
            const appointments = await window.HolaDocStorage.getAppointments({ patientDni: user.dni });

            const allItems = [
                ...requests.map(r => ({ ...r, isAppt: false })),
                ...appointments.map(a => ({ ...a, isAppt: true, type: 'turno', createdAt: a.createdAt || a.date + 'T00:00:00.000Z' }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            async function renderTabs(activeTab) {
                let tabContent = '';

                if (activeTab === 'requests') {
                    if (allItems.length === 0) {
                        tabContent = `
                            <div class="empty-state">
                                <div class="empty-state-icon">📋</div>
                                <h3 class="empty-state-title">No tenés solicitudes cargadas</h3>
                                <p class="text-muted">Todas las recetas, turnos y derivaciones aparecerán acá.</p>
                            </div>
                        `;
                    } else {
                        tabContent = `
                            <div class="grid" style="gap:16px;">
                                ${(await Promise.all(allItems.map(async r => {
                                    let icon = '📋';
                                    let typeName = 'Solicitud';
                                    let detailsPreview = '';
                                    
                                    if (r.isAppt) {
                                        icon = '📅';
                                        typeName = 'Turno Programado';
                                        detailsPreview = `Turno para el día ${new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')} a las ${r.time} hs.`;
                                    } else {
                                        if (r.type === 'receta') { 
                                            icon = '💊'; 
                                            typeName = 'Receta Médica'; 
                                            detailsPreview = r.details.medications;
                                        } else if (r.type === 'derivacion') { 
                                            icon = '🔄'; 
                                            typeName = 'Derivación Especialista'; 
                                            detailsPreview = `Derivación a: ${r.details.specialty}`;
                                        } else if (r.type === 'estudio') { 
                                            icon = '🔬'; 
                                            typeName = 'Estudio de Imagen/Lab'; 
                                            detailsPreview = `${r.details.studyType} - ${r.details.details}`;
                                        } else if (r.type === 'internacion') { 
                                            icon = '🏠'; 
                                            typeName = 'Internación Domiciliaria'; 
                                            detailsPreview = `Dirección: ${r.details.address}`;
                                        }
                                    }

                                    const doc = await window.HolaDocStorage.getDoctor(r.doctorDni);
                                    const docName = doc ? doc.name : 'Médico General';
                                    const dateStr = new Date(r.createdAt).toLocaleDateString('es-AR');

                                    // Status styling
                                    let borderCol = '--warning';
                                    let statusLbl = r.status;
                                    if (r.status === 'completada' || r.status === 'confirmado') {
                                        borderCol = '--accent';
                                        statusLbl = r.status === 'confirmado' ? 'Confirmado' : 'Listo';
                                    } else if (r.status === 'rechazada' || r.status === 'cancelado') {
                                        borderCol = '--danger';
                                        statusLbl = r.status === 'cancelado' ? 'Cancelado' : 'Rechazado';
                                    } else if (r.status === 'pendiente') {
                                        statusLbl = 'Pendiente';
                                    }

                                    return `
                                        <div class="card card-3d" style="text-align:left; border-left:6px solid var(${borderCol});">
                                            <div class="flex-between mb-1">
                                                <div class="flex gap-2" style="align-items:center;">
                                                    <span style="font-size:28px;">${icon}</span>
                                                    <div>
                                                        <h3 style="font-weight:800; font-size:18px; margin:0;">${typeName}</h3>
                                                        <span class="text-muted" style="font-size:14px;">Profesional: ${docName}</span>
                                                    </div>
                                                </div>
                                                <span class="badge badge-${r.status}">
                                                    ${statusLbl}
                                                </span>
                                            </div>
                                            <p style="font-size:16px; margin:8px 0; color:var(--text-secondary); background:rgba(0,0,0,0.01); padding:8px 12px; border-radius:6px;">
                                                <b>Detalle:</b> ${detailsPreview}
                                            </p>
                                            
                                            ${r.status === 'cancelado' && r.cancelReason ? `
                                                <div style="margin: 8px 0; padding: 10px 14px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; color: #991B1B; font-size:15px;">
                                                    ⚠️ <b>Motivo de la cancelación:</b> ${escapeHtml(r.cancelReason)}
                                                </div>
                                            ` : ''}

                                            <div class="flex-between mt-2" style="font-size:14px; border-top:1px solid var(--bg-secondary); padding-top:8px;">
                                                <span class="text-muted">Fecha: ${dateStr}</span>
                                                ${r.isAppt && r.status === 'pendiente' ? `<button class="btn btn-outline patient-cancel-appt" data-id="${r.id}" style="height:36px; padding:0 12px; font-size:14px; border-radius:8px; border-color:var(--danger); color:var(--danger);">Cancelar Turno</button>` : ''}
                                                ${!r.isAppt ? `<a href="#/patient/solicitud/${r.id}" class="btn btn-outline" style="height:36px; padding:0 12px; font-size:14px; border-radius:8px;">Ver receta / detalle</a>` : ''}
                                            </div>
                                        </div>
                                    `;
                                }))).join('')}
                            </div>
                        `;
                    }
                } else {
                    if (records.length === 0) {
                        tabContent = `
                            <div class="empty-state">
                                <div class="empty-state-icon">📋</div>
                                <h3 class="empty-state-title">Sin consultas registradas</h3>
                                <p class="text-muted">Tu médico completará tu historia clínica cuando asistas a una consulta.</p>
                            </div>
                        `;
                    } else {
                        tabContent = `
                            <div class="timeline">
                                ${(await Promise.all(records.map(async r => {
                                    const doc = await window.HolaDocStorage.getDoctor(r.doctorDni);
                                    const docName = doc ? doc.name : 'Médico General';
                                    return `
                                        <div class="timeline-item">
                                            <div class="timeline-date">${new Date(r.date).toLocaleDateString('es-AR', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                                            <div class="card" style="text-align:left; margin-top:8px;">
                                                <h3 style="font-weight:800; font-size:18px; margin:0 0 12px 0; color:var(--primary);">Atendido por: ${docName}</h3>
                                                
                                                <div style="margin-bottom:8px;">
                                                    <b style="font-size:16px;">📋 Motivo de Consulta:</b>
                                                    <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.reason}</p>
                                                </div>

                                                ${r.pathologicalHistory ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🏥 Antecedentes Patológicos:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.pathologicalHistory}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.surgicalHistory ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🔪 Antecedentes Quirúrgicos:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.surgicalHistory}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.currentMedication ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">💊 Medicación Actual:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.currentMedication}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.nextObjectives ? `
                                                    <div style="margin-bottom:8px;">
                                                        <b style="font-size:16px;">🎯 Objetivos para próxima consulta:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.nextObjectives}</p>
                                                    </div>
                                                ` : ''}

                                                ${r.notes ? `
                                                    <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--bg-secondary);">
                                                        <b style="font-size:16px;">📝 Indicaciones/Notas Médicas:</b>
                                                        <p style="margin:4px 0 0 0; font-size:16px; color:var(--text-secondary);">${r.notes}</p>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }))).join('')}
                            </div>
                        `;
                    }
                }

                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header">
                            <a href="#/patient" class="page-back">← Volver al inicio</a>
                            <h1 class="page-title">Mis Solicitudes y HC</h1>
                            <p class="page-subtitle">Seguí el estado de tus pedidos y consultá tu historia clínica</p>
                        </div>

                        <!-- Tab controls -->
                        <div class="tabs">
                            <div class="tab ${activeTab === 'requests' ? 'tab--active' : ''}" id="tab-btn-requests">📋 Mis Pedidos (${requests.length})</div>
                            <div class="tab ${activeTab === 'history' ? 'tab--active' : ''}" id="tab-btn-history">⚕️ Historia Clínica (${records.length})</div>
                        </div>

                        <div id="tab-pane-content">
                            ${tabContent}
                        </div>
                    </div>
                `;

                // Add listeners to tabs
                document.getElementById('tab-btn-requests').addEventListener('click', async () => await renderTabs('requests'));
                document.getElementById('tab-btn-history').addEventListener('click', async () => await renderTabs('history'));

                // Event delegation for cancel buttons
                container.querySelectorAll('.patient-cancel-appt').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const appt = appointments.find(a => a.id === id);
                        if (!appt) return;
                        const dateStr = new Date(appt.date + 'T00:00:00').toLocaleDateString('es-AR', {day: '2-digit', month: 'long', year: 'numeric'});
                        showCancelAppointmentModal(appt, dateStr, () => window.HolaDocPatient.renderHistory(container));
                    });
                });
            }

            function showCancelAppointmentModal(appt, dateStr, refreshFn) {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal slide-up" style="max-width:450px">
                        <div class="modal-header">
                            <h3 style="font-weight:900; font-size:20px; color:var(--primary); margin:0;">⚠️ Cancelar Turno</h3>
                            <button class="modal-close" id="cancel-appt-close">✖</button>
                        </div>
                        <div class="card-body" style="padding-top:16px;">
                            <p style="font-size:16px; margin-bottom:16px; color:var(--text-secondary);">
                                ¿Estás seguro de que deseas cancelar tu turno programado para el día <strong>${dateStr}</strong>?
                            </p>
                            <div class="form-group">
                                <label class="form-label">Motivo de la cancelación *</label>
                                <textarea class="form-textarea" id="cancel-appt-reason" rows="3" placeholder="Ej: No podré asistir por motivos personales..." required></textarea>
                            </div>
                            <button class="btn btn-danger btn-lg btn-block" id="cancel-appt-confirm">CANCELAR TURNO</button>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);

                overlay.querySelector('#cancel-appt-close').addEventListener('click', () => overlay.remove());
                overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

                overlay.querySelector('#cancel-appt-confirm').addEventListener('click', async () => {
                    const reason = overlay.querySelector('#cancel-appt-reason').value.trim();
                    if (!reason) { window.HolaDocApp.showToast('Debe indicar el motivo de la cancelación', 'error'); return; }

                    await window.HolaDocStorage.updateAppointment(appt.id, {
                        status: 'cancelado',
                        cancelReason: reason
                    });

                    // Notify doctor
                    const user = window.HolaDocStorage.getCurrentUser();
                    await window.HolaDocApp._notifications().createNotification(
                        appt.doctorDni, 'doctor', 'turno',
                        'Turno cancelado por paciente',
                        `El paciente ${user.name} canceló su turno del ${dateStr}. Motivo: ${reason}`,
                        appt.id
                    );

                    window.HolaDocApp.showToast('Turno cancelado correctamente', 'warning');
                    overlay.remove();
                    refreshFn();
                });
            }

            await renderTabs('requests');
        },


        async renderRequestDetail(container, requestId) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const req = (await window.HolaDocStorage.getRequests()).find(r => r.id === requestId);
            if (!req) {
                container.innerHTML = `<div class="empty-state"><h3>No se encontró la solicitud</h3></div>`;
                return;
            }

            const doc = await window.HolaDocStorage.getDoctor(req.doctorDni);
            const docName = doc ? doc.name : 'Médico General';
            const spec = doc ? doc.specialty : '';

            let detailsHTML = '';
            if (req.type === 'receta') {
                detailsHTML = `
                    <p style="font-size:17px;"><b>Medicamentos solicitados:</b></p>
                    <p style="background:rgba(0,0,0,0.02); padding:16px; border-radius:8px; font-size:17px; font-weight:600; line-height:1.5;">${req.details.medications}</p>
                `;
            } else if (req.type === 'derivacion') {
                detailsHTML = `
                    <p style="font-size:17px;"><b>Especialidad de interconsulta:</b> ${req.details.specialty}</p>
                    <p style="font-size:17px;"><b>Motivo:</b> ${req.details.reason}</p>
                `;
            } else if (req.type === 'estudio') {
                detailsHTML = `
                    <p style="font-size:17px;"><b>Tipo de estudio:</b> ${req.details.studyType}</p>
                    <p style="font-size:17px;"><b>Detalles/Zona:</b> ${req.details.details}</p>
                    <p style="font-size:17px;"><b>Motivo:</b> ${req.details.reason}</p>
                `;
            } else if (req.type === 'internacion') {
                detailsHTML = `
                    <p style="font-size:17px;"><b>Domicilio de atención:</b> ${req.details.address}</p>
                    <p style="font-size:17px;"><b>Motivo y Cuidados:</b> ${req.details.reason}</p>
                `;
            }

            let responseHTML = '';
            if (req.status === 'completada' && req.type === 'receta' && req.response) {
                responseHTML = `
                    <div class="prescription-card mt-3">
                        <div class="prescription-header">
                            <div>
                                <h3 style="font-weight:900; font-size:22px; color:var(--text-primary); margin:0;">RECETA DIGITAL</h3>
                                <p style="font-size:14px; color:var(--text-muted); margin:4px 0 0 0;">HolaDoc! Salud Remota</p>
                            </div>
                            <span class="prescription-stamp">OFICIAL</span>
                        </div>
                        <div style="margin-bottom:16px;">
                            <p style="margin:4px 0; font-size:16px;"><b>Paciente:</b> ${user.name}</p>
                            <p style="margin:4px 0; font-size:16px;"><b>DNI:</b> ${user.dni}</p>
                            <p style="margin:4px 0; font-size:16px;"><b>Obra Social:</b> ${user.obraSocial} (Nro: ${user.nroAfiliado})</p>
                        </div>
                        <div style="border-top:1px solid rgba(0,0,0,0.06); border-bottom:1px solid rgba(0,0,0,0.06); padding:16px 0; margin-bottom:16px;">
                            <p style="font-size:18px; font-weight:800; color:var(--primary); margin:0 0 8px 0;">RP/ Prescripción:</p>
                            <p style="font-size:18px; font-weight:700; white-space:pre-line; line-height:1.5;">${req.response.prescribedMedications || req.response.prescription || req.details.medications}</p>
                        </div>
                        ${req.response.diagnostico ? `<p style="font-size:16px; margin:4px 0;"><b>Diagnóstico:</b> ${req.response.diagnostico}</p>` : ''}
                        ${req.response.indicaciones ? `<p style="font-size:16px; margin:4px 0;"><b>Indicaciones:</b> ${req.response.indicaciones}</p>` : ''}
                        
                        ${req.status === 'completada' && req.type === 'receta' ? `
                            <div style="margin: 16px 0; padding: 16px; border: 2px dashed #059669; background-color: #ECFDF5; border-radius: 8px; color: #065F46; font-weight: 700; font-size: 16px; text-align: center; line-height: 1.4;">
                                Su receta fue realizada con éxito. Diríjase a la farmacia que trabaje con su obra social${(user.obraSocial || '').toUpperCase().includes('PAMI') ? ' (o en caso de PAMI, a la Red PAMI)' : ''}.
                            </div>
                        ` : ''}

                        <div style="text-align:right; margin-top:24px; font-size:16px; font-style:italic;">
                            <p style="margin:0; font-weight:700; color:var(--text-primary);">${req.response.doctorName || req.response.doctorSignature || `Dr./Dra. asignado`}</p>
                            <p style="margin:0; color:var(--text-muted); font-size:14px;">Firma Digital HolaDoc!</p>
                        </div>
                    </div>
                `;
            } else if (req.status === 'completada') {
                responseHTML = `
                    <div class="card mt-3" style="background:#F0FDF4; border-left:6px solid var(--accent); text-align:left;">
                        <h3 style="font-weight:800; font-size:19px; color:var(--accent); margin:0 0 8px 0;">✓ Solicitud Aprobada</h3>
                        <p style="font-size:17px; margin:4px 0;">La solicitud fue revisada y completada con éxito por el profesional.</p>
                        ${req.response && req.response.notes ? `<p style="font-size:17px; margin:8px 0 0 0;"><b>Notas del médico:</b> ${req.response.notes}</p>` : ''}
                    </div>
                `;
            } else if (req.status === 'rechazada') {
                responseHTML = `
                    <div class="card mt-3" style="background:#FDF2F2; border-left:6px solid var(--danger); text-align:left;">
                        <h3 style="font-weight:800; font-size:19px; color:var(--danger); margin:0 0 8px 0;">✕ Solicitud Rechazada</h3>
                        <p style="font-size:17px; margin:4px 0;"><b>Motivo:</b> ${req.response && req.response.reason ? req.response.reason : 'Revisar con tu médico de cabecera.'}</p>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="page-enter">
                    <div class="page-header">
                        <a href="#/patient" class="page-back">← Volver al panel</a>
                        <h1 class="page-title">Detalle de Solicitud</h1>
                        <p class="page-subtitle">Seguimiento en tiempo real de tu pedido</p>
                    </div>

                    <div class="card" style="text-align:left; margin-bottom:24px;">
                        <div class="flex-between" style="border-bottom:1px solid var(--bg-secondary); padding-bottom:16px; margin-bottom:16px;">
                            <div>
                                <span class="badge badge-${req.status}" style="font-size:16px; padding:6px 16px;">
                                    ${req.status === 'pendiente' ? 'Pendiente de firma' : ''}
                                    ${req.status === 'en_proceso' ? 'En revisión' : ''}
                                    ${req.status === 'completada' ? 'Listo' : ''}
                                    ${req.status === 'rechazada' ? 'Rechazado' : ''}
                                </span>
                            </div>
                            <span style="font-size:16px; color:var(--text-muted); font-weight:600;">Enviado: ${new Date(req.createdAt).toLocaleDateString('es-AR')}</span>
                        </div>

                        <p style="font-size:18px; margin: 8px 0;"><b>Médico asignado:</b> ${docName} (${spec})</p>
                        ${detailsHTML}
                    </div>

                    ${responseHTML}
                </div>
            `;
        }
    };
})();
