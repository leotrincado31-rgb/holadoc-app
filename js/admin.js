/**
 * HolaDoc! — Admin Module
 * Panel de control para el administrador (eliminar médicos y pacientes).
 */
(function() {
    'use strict';

    function _app()     { return window.HolaDocApp; }
    function _storage() { return window.HolaDocStorage; }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function renderDashboard(container) {
        container.innerHTML = `
            <div class="page-enter" style="text-align:center; padding:40px;">
                <div class="loader"></div>
                <p class="text-muted mt-2">Cargando datos del panel...</p>
            </div>
        `;

        try {
            const [doctors, patients] = await Promise.all([
                _storage().getDoctors(),
                _storage().getPatients()
            ]);

            async function draw() {
                const docListHTML = doctors.length === 0 
                    ? '<p class="text-muted">No hay médicos registrados.</p>'
                    : `<div class="stagger-children" style="display:flex;flex-direction:column;gap:12px;">
                        ${doctors.map(d => `
                            <div class="card flex-between" style="padding:16px;">
                                <div>
                                    <div style="font-weight:700;font-size:16px;">${escapeHtml(d.name)}</div>
                                    <div class="text-muted" style="font-size:13px;">DNI: ${escapeHtml(d.dni)} • Mat: ${escapeHtml(d.matricula || '-')} • Esp: ${escapeHtml(d.specialty || '-')}</div>
                                </div>
                                <button class="btn btn-danger btn-sm btn-delete-doc" data-dni="${d.dni}" style="padding:8px 16px;">🗑️ Eliminar</button>
                            </div>
                        `).join('')}
                       </div>`;

                const patListHTML = patients.length === 0
                    ? '<p class="text-muted">No hay pacientes registrados.</p>'
                    : `<div class="stagger-children" style="display:flex;flex-direction:column;gap:12px;">
                        ${patients.map(p => `
                            <div class="card flex-between" style="padding:16px;">
                                <div>
                                    <div style="font-weight:700;font-size:16px;">${escapeHtml(p.name)}</div>
                                    <div class="text-muted" style="font-size:13px;">DNI: ${escapeHtml(p.dni)} • OS: ${escapeHtml(p.obraSocial || '-')}</div>
                                </div>
                                <button class="btn btn-danger btn-sm btn-delete-pat" data-dni="${p.dni}" style="padding:8px 16px;">🗑️ Eliminar</button>
                            </div>
                        `).join('')}
                       </div>`;

                container.innerHTML = `
                    <div class="page-enter">
                        <div class="page-header flex-between mb-3">
                            <div>
                                <h1 class="page-title" style="color:var(--danger)">🛡️ Panel de Administrador</h1>
                                <p class="page-subtitle">Gestiona médicos y pacientes de la plataforma</p>
                            </div>
                            <button class="btn btn-outline" id="btn-admin-logout">Cerrar Sesión</button>
                        </div>
                        
                        <div class="grid grid-2 mb-3">
                            <div class="card card-3d text-center" style="border-top:4px solid var(--primary)">
                                <h2 style="font-size:2rem;margin:0;">${doctors.length}</h2>
                                <p class="text-muted text-uppercase" style="font-size:12px;font-weight:700;letter-spacing:1px;">Médicos Registrados</p>
                            </div>
                            <div class="card card-3d text-center" style="border-top:4px solid var(--success)">
                                <h2 style="font-size:2rem;margin:0;">${patients.length}</h2>
                                <p class="text-muted text-uppercase" style="font-size:12px;font-weight:700;letter-spacing:1px;">Pacientes Registrados</p>
                            </div>
                        </div>

                        <div class="grid grid-2" style="gap:24px;">
                            <div class="section">
                                <h2 class="section-title">Médicos</h2>
                                ${docListHTML}
                            </div>
                            <div class="section">
                                <h2 class="section-title">Pacientes</h2>
                                ${patListHTML}
                            </div>
                        </div>
                    </div>
                `;

                // Event Listeners
                container.querySelector('#btn-admin-logout').addEventListener('click', () => {
                    window.HolaDocAuth.logout();
                    _app().navigate('/login');
                });

                container.querySelectorAll('.btn-delete-doc').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const dni = btn.dataset.dni;
                        if (confirm(`¿Estás seguro que deseas eliminar permanentemente al médico con DNI ${dni}?`)) {
                            const success = await _storage().deleteDoctor(dni);
                            if (success) {
                                _app().showToast('Médico eliminado correctamente', 'success');
                                const index = doctors.findIndex(d => d.dni === dni);
                                if (index > -1) doctors.splice(index, 1);
                                draw();
                            } else {
                                _app().showToast('Error al eliminar médico', 'error');
                            }
                        }
                    });
                });

                container.querySelectorAll('.btn-delete-pat').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const dni = btn.dataset.dni;
                        if (confirm(`¿Estás seguro que deseas eliminar permanentemente al paciente con DNI ${dni}?`)) {
                            const success = await _storage().deletePatient(dni);
                            if (success) {
                                _app().showToast('Paciente eliminado correctamente', 'success');
                                const index = patients.findIndex(p => p.dni === dni);
                                if (index > -1) patients.splice(index, 1);
                                draw();
                            } else {
                                _app().showToast('Error al eliminar paciente', 'error');
                            }
                        }
                    });
                });
            }

            draw();
        } catch (e) {
            container.innerHTML = `<div class="empty-state"><p class="text-danger">Error al cargar datos: ${e.message}</p></div>`;
        }
    }

    window.HolaDocAdmin = {
        renderDashboard
    };

})();
