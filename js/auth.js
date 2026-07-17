/**
 * HolaDoc! — Authentication Module
 * Renders Login and Register views.
 * DNI-based simple authentication.
 */
(function() {
    'use strict';

    const SPECIALTIES = ['Clínica Médica','Cardiología','Dermatología','Endocrinología','Gastroenterología','Ginecología','Nefrología','Neumonología','Neurología','Oftalmología','Otorrinolaringología','Pediatría','Psiquiatría','Traumatología','Urología'];

    window.HolaDocAuth = {
        renderLogin(container) {
            container.innerHTML = `
                <div class="landing-page">
                    <div class="landing-bg">
                        <div class="landing-circle landing-circle-1"></div>
                        <div class="landing-circle landing-circle-2"></div>
                    </div>
                    <div class="landing-content fade-in">
                        <div class="landing-hero" style="margin-bottom: 24px;">
                            <div class="landing-logo float" style="width: 80px; height: 80px;">
                                <span class="landing-logo-icon" style="font-size: 40px;">🏥</span>
                            </div>
                            <h2 class="landing-title" style="font-size: var(--text-2xl);">Ingresar a HolaDoc!</h2>
                            <p class="landing-subtitle">Ingresá con tu número de DNI</p>
                        </div>

                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label" for="login-dni">Número de DNI</label>
                                <input type="number" id="login-dni" class="form-input" placeholder="Ej: 11111111" required pattern="[0-9]{7,8}">
                                <div class="form-error hidden" id="login-error"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2" id="btn-submit-login">
                                INGRESAR
                            </button>
                        </form>

                        <div style="margin-top: 24px;">
                            <p class="text-muted" style="font-size:16px;">
                                ¿No tenés cuenta? 
                                <a href="#/register" style="color: var(--primary); font-weight: 700; text-decoration: none;">Registrate acá</a>
                            </p>
                            <a href="#/" class="btn-back" style="margin-top: 16px; display: inline-block;">← Volver al inicio</a>
                        </div>
                    </div>
                </div>
            `;

            const form = document.getElementById('login-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const dni = document.getElementById('login-dni').value.trim();
                const errorDiv = document.getElementById('login-error');

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                const user = this.login(dni);
                if (user) {
                    window.HolaDocApp.showToast(`¡Hola de nuevo, ${user.name}!`, 'success');
                    window.HolaDocApp.navigate(user.type === 'patient' ? '/patient' : '/doctor');
                } else {
                    errorDiv.textContent = 'No encontramos una cuenta con ese DNI. Por favor, registrate.';
                    errorDiv.classList.remove('hidden');
                }
            });
        },

        renderRegister(container) {
            container.innerHTML = `
                <div class="landing-page">
                    <div class="landing-bg">
                        <div class="landing-circle landing-circle-1"></div>
                        <div class="landing-circle landing-circle-2"></div>
                    </div>
                    <div class="landing-content fade-in" style="max-width: 600px;">
                        <h2 class="landing-title mb-2">Crear Cuenta</h2>
                        <p class="landing-subtitle mb-3">¿Cómo vas a usar HolaDoc!?</p>

                        <div class="grid grid-2" style="margin-bottom: 24px;">
                            <a href="#/register/patient" class="action-card action-card--turno" id="register-as-patient">
                                <div class="action-icon">🏥</div>
                                <h3 style="font-weight:800; font-size:22px; margin-top:8px;">Soy Paciente</h3>
                                <p class="text-muted" style="font-size:15px; margin-top:4px;">Para solicitar recetas, turnos y ver mis estudios.</p>
                            </a>
                            <a href="#/register/doctor" class="action-card action-card--receta" id="register-as-doctor">
                                <div class="action-icon">⚕️</div>
                                <h3 style="font-weight:800; font-size:22px; margin-top:8px;">Soy Médico</h3>
                                <p class="text-muted" style="font-size:15px; margin-top:4px;">Para gestionar mis pacientes, recetas y agenda.</p>
                            </a>
                        </div>

                        <a href="#/login" class="btn-back">← Volver al ingreso</a>
                    </div>
                </div>
            `;
        },

        renderPatientRegister(container) {
            container.innerHTML = `
                <div class="landing-page">
                    <div class="landing-bg">
                        <div class="landing-circle landing-circle-1"></div>
                    </div>
                    <div class="landing-content fade-in" style="max-width: 500px; padding: 32px 24px;">
                        <h2 class="landing-title" style="font-size:26px;">Registro de Paciente</h2>
                        <p class="landing-subtitle mb-2">Ingresá tus datos para registrarte</p>

                        <form id="patient-register-form">
                            <div class="form-group">
                                <label class="form-label" for="reg-dni">DNI</label>
                                <input type="number" id="reg-dni" class="form-input" placeholder="Ej: 11111111" required>
                                <div class="form-error hidden" id="reg-dni-error"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-name">Nombre y Apellido</label>
                                <input type="text" id="reg-name" class="form-input" placeholder="Ej: Juan Pérez" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-phone">Celular o Teléfono</label>
                                <input type="tel" id="reg-phone" class="form-input" placeholder="Ej: 1122334455">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-birth">Fecha de Nacimiento</label>
                                <input type="date" id="reg-birth" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-obrasocial">Obra Social o Prepaga</label>
                                <input type="text" id="reg-obrasocial" class="form-input" placeholder="Ej: PAMI, OSDE, Medifé" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-nroafiliado">Número de Afiliado</label>
                                <input type="text" id="reg-nroafiliado" class="form-input" placeholder="Ej: 9876543210" required>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2">
                                REGISTRARME
                            </button>
                        </form>

                        <div style="margin-top: 16px;">
                            <a href="#/register" class="btn-back">← Volver</a>
                        </div>
                    </div>
                </div>
            `;

            const form = document.getElementById('patient-register-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const dni = document.getElementById('reg-dni').value.trim();
                const name = document.getElementById('reg-name').value.trim();
                const phone = document.getElementById('reg-phone').value.trim();
                const birthDate = document.getElementById('reg-birth').value;
                const obraSocial = document.getElementById('reg-obrasocial').value.trim();
                const nroAfiliado = document.getElementById('reg-nroafiliado').value.trim();
                const errorDiv = document.getElementById('reg-dni-error');

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                const success = window.HolaDocStorage.savePatient({
                    dni, name, phone, birthDate, obraSocial, nroAfiliado
                });

                if (success) {
                    const user = window.HolaDocStorage.getPatient(dni);
                    this.login(dni);
                    window.HolaDocApp.showToast('¡Registro de paciente exitoso!', 'success');
                    window.HolaDocApp.navigate('/patient');
                } else {
                    errorDiv.textContent = 'Este DNI ya está registrado.';
                    errorDiv.classList.remove('hidden');
                }
            });
        },

        renderDoctorRegister(container) {
            container.innerHTML = `
                <div class="landing-page">
                    <div class="landing-bg">
                        <div class="landing-circle landing-circle-2"></div>
                    </div>
                    <div class="landing-content fade-in" style="max-width: 500px; padding: 32px 24px;">
                        <h2 class="landing-title" style="font-size:26px;">Registro de Médico</h2>
                        <p class="landing-subtitle mb-2">Ingresá tus datos profesionales</p>

                        <form id="doctor-register-form">
                            <div class="form-group">
                                <label class="form-label" for="reg-dni">DNI</label>
                                <input type="number" id="reg-dni" class="form-input" placeholder="Ej: 99999999" required>
                                <div class="form-error hidden" id="reg-dni-error"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-name">Nombre completo (con Dr./Dra.)</label>
                                <input type="text" id="reg-name" class="form-input" placeholder="Ej: Dra. Silvia Pérez" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-matricula">Matrícula Nacional/Provincial</label>
                                <input type="text" id="reg-matricula" class="form-input" placeholder="Ej: MN12345" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-specialty">Especialidad</label>
                                <select id="reg-specialty" class="form-select" required>
                                    <option value="" disabled selected>Seleccioná especialidad</option>
                                    ${SPECIALTIES.map(s => `<option value="${s}">${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="reg-phone">Celular o Teléfono de contacto</label>
                                <input type="tel" id="reg-phone" class="form-input" placeholder="Ej: 1122334455">
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2">
                                REGISTRARME
                            </button>
                        </form>

                        <div style="margin-top: 16px;">
                            <a href="#/register" class="btn-back">← Volver</a>
                        </div>
                    </div>
                </div>
            `;

            const form = document.getElementById('doctor-register-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const dni = document.getElementById('reg-dni').value.trim();
                const name = document.getElementById('reg-name').value.trim();
                const matricula = document.getElementById('reg-matricula').value.trim();
                const specialty = document.getElementById('reg-specialty').value;
                const phone = document.getElementById('reg-phone').value.trim();
                const errorDiv = document.getElementById('reg-dni-error');

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                // Default schedule
                const schedule = {
                    lunes: { active: true, start: '08:00', end: '16:00' },
                    martes: { active: true, start: '08:00', end: '16:00' },
                    miercoles: { active: true, start: '08:00', end: '16:00' },
                    jueves: { active: true, start: '08:00', end: '16:00' },
                    viernes: { active: true, start: '08:00', end: '16:00' },
                    sabado: { active: false, start: '09:00', end: '12:00' },
                    domingo: { active: false, start: '09:00', end: '12:00' }
                };

                const success = window.HolaDocStorage.saveDoctor({
                    dni, name, matricula, specialty, phone, schedule, consultationDuration: '30'
                });

                if (success) {
                    const user = window.HolaDocStorage.getDoctor(dni);
                    this.login(dni);
                    window.HolaDocApp.showToast('¡Registro profesional exitoso!', 'success');
                    window.HolaDocApp.navigate('/doctor');
                } else {
                    errorDiv.textContent = 'Este DNI ya está registrado.';
                    errorDiv.classList.remove('hidden');
                }
            });
        },

        login(dni) {
            let user = window.HolaDocStorage.getPatient(dni);
            if (!user) {
                user = window.HolaDocStorage.getDoctor(dni);
            }

            if (user) {
                window.HolaDocStorage.setCurrentUser(user);
                return user;
            }
            return null;
        },

        logout() {
            window.HolaDocStorage.clearCurrentUser();
        },

        getCurrentUser() {
            return window.HolaDocStorage.getCurrentUser();
        }
    };
})();
