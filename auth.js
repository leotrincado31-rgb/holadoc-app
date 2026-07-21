/**
 * HolaDoc! — Authentication Module
 * Estilo Apicona — Corporativo / Médico
 * Login y Registro con diseño consistente con la landing.
 */
(function() {
    'use strict';

    const SPECIALTIES = ['Clínica Médica','Cardiología','Dermatología','Endocrinología','Gastroenterología','Ginecología','Nefrología','Neumonología','Neurología','Oftalmología','Otorrinolaringología','Pediatría','Psiquiatría','Traumatología','Urología'];

    // ── Shared Layout wrapper (navbar + footer simples) ──────────
    function authPageHTML(content) {
        return `
        <div style="min-height:100vh;display:flex;flex-direction:column;background:#F5F5F5;font-family:'Poppins',sans-serif;">

          <!-- Mini Navbar -->
          <nav style="background:#fff;border-bottom:1px solid #E0E0E0;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.06);position:relative;z-index:10;">
            <a href="#/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
              <div style="width:38px;height:38px;background:#034C81;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;">🏥</div>
              <span style="font-size:20px;font-weight:800;color:#1A1A1A;letter-spacing:-0.5px;font-family:'Poppins',sans-serif;">Hola<span style="color:#034C81;">Doc!</span></span>
            </a>
            <a href="#/" style="font-size:13px;font-weight:600;color:#666;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">← Volver al inicio</a>
          </nav>

          <!-- Content with blurred clinic background -->
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:40px 16px;background:linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.75)), url('img/auth_bg.png') no-repeat center center;background-size:cover;position:relative;">
            ${content}
          </div>

          <!-- Footer mini -->
          <div style="background:#1E1E1E;padding:16px 24px;text-align:center;position:relative;z-index:10;">
            <span style="font-size:12px;color:rgba(255,255,255,0.4);font-family:'Poppins',sans-serif;">© 2025 HolaDoc! — Plataforma de Salud Digital</span>
          </div>
        </div>
        `;
    }

    // ── Card wrapper ─────────────────────────────────────────────
    function authCard(title, subtitle, iconHtml, body) {
        return `
        <div style="background:#fff;border:1px solid #E0E0E0;border-radius:12px;padding:40px 36px;width:100%;max-width:460px;box-shadow:0 10px 30px rgba(3,76,129,0.15);animation:fadeInUp .3s ease both;position:relative;z-index:5;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:68px;height:68px;background:#EFF6FF;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#034C81;border:1px solid rgba(3,76,129,0.15);">
              ${iconHtml}
            </div>
            <h1 style="font-size:24px;font-weight:800;color:#1A1A1A;margin-bottom:6px;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:0.5px;">${title}</h1>
            <p style="font-size:14px;color:#666;font-family:'Poppins',sans-serif;">${subtitle}</p>
          </div>
          ${body}
        </div>
        `;
    }

    // ── Field helper ─────────────────────────────────────────────
    function field(id, label, type, placeholder, required = true, extraAttrs = '') {
        return `
        <div style="margin-bottom:16px;">
          <label for="${id}" style="display:block;font-size:11px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;font-family:'Poppins',sans-serif;">${label}</label>
          <input type="${type}" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} ${extraAttrs}
            style="width:100%;padding:12px 14px;font-size:14px;color:#1A1A1A;background:#fff;border:1.5px solid #E0E0E0;border-radius:6px;outline:none;font-family:'Poppins',sans-serif;transition:border-color .2s;"
            onfocus="this.style.borderColor='#034C81';this.style.boxShadow='0 0 0 3px rgba(3,76,129,0.1)'"
            onblur="this.style.borderColor='#E0E0E0';this.style.boxShadow='none'">
        </div>`;
    }

    function selectField(id, label, options) {
        return `
        <div style="margin-bottom:16px;">
          <label for="${id}" style="display:block;font-size:11px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;font-family:'Poppins',sans-serif;">${label}</label>
          <select id="${id}" required
            style="width:100%;padding:12px 14px;font-size:14px;color:#1A1A1A;background:#fff;border:1.5px solid #E0E0E0;border-radius:6px;outline:none;font-family:'Poppins',sans-serif;appearance:none;transition:border-color .2s;"
            onfocus="this.style.borderColor='#034C81';this.style.boxShadow='0 0 0 3px rgba(3,76,129,0.1)'"
            onblur="this.style.borderColor='#E0E0E0';this.style.boxShadow='none'">
            <option value="" disabled selected>Seleccioná especialidad</option>
            ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>
        </div>`;
    }

    function submitBtn(text, id = 'btn-submit') {
        return `
        <button type="submit" id="${id}"
          style="width:100%;padding:14px;background:#034C81;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;cursor:pointer;font-family:'Poppins',sans-serif;margin-top:8px;transition:background .2s;"
          onmouseover="this.style.background='#023A63'"
          onmouseout="this.style.background='#034C81'">
          ${text}
        </button>`;
    }

    function errorBox(id) {
        return `<div id="${id}" style="display:none;background:#FEE2E2;border:1px solid #FECACA;border-radius:6px;padding:10px 14px;font-size:13px;color:#991B1B;margin-bottom:12px;font-family:'Poppins',sans-serif;"></div>`;
    }

    window.HolaDocAuth = {

        // ── LOGIN ────────────────────────────────────────────────
        renderLogin(container) {
            container.innerHTML = authPageHTML(authCard(
                'Iniciar Sesión',
                'Ingresá con tu número de DNI — Sin contraseñas',
                `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
                `
                ${errorBox('login-error')}
                <form id="login-form">
                  ${field('login-dni', 'Número de DNI', 'number', 'Ej: 11111111', true, 'pattern="[0-9]{7,8}" inputmode="numeric"')}
                  ${submitBtn('Ingresar Ahora', 'btn-submit-login')}
                </form>
                <div style="margin-top:24px;text-align:center;">
                  <p style="font-size:13px;color:#666;font-family:'Poppins',sans-serif;">
                    ¿No tenés cuenta?
                    <a href="#/register" style="color:#034C81;font-weight:700;text-decoration:none;margin-left:4px;">Registrate acá</a>
                  </p>
                </div>
                `
            ));

            const form = document.getElementById('login-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const dni = document.getElementById('login-dni').value.trim();
                const errorDiv = document.getElementById('login-error');
                errorDiv.style.display = 'none';

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.style.display = 'block';
                    return;
                }

                const user = await this.login(dni);
                if (user) {
                    window.HolaDocApp.showToast(`¡Hola de nuevo, ${user.name}!`, 'success');
                    window.HolaDocApp.navigate(user.type === 'patient' ? '/patient' : '/doctor');
                } else {
                    errorDiv.textContent = 'No encontramos una cuenta con ese DNI. Por favor, registrate.';
                    errorDiv.style.display = 'block';
                }
            });
        },

        // ── REGISTER (selección de tipo) ─────────────────────────
        renderRegister(container) {
            container.innerHTML = authPageHTML(`
            <div style="width:100%;max-width:580px;animation:fadeInUp .3s ease both;position:relative;z-index:5;background:#fff;border:1px solid #E0E0E0;border-radius:12px;padding:40px 36px;box-shadow:0 10px 30px rgba(3,76,129,0.15);">
              <div style="text-align:center;margin-bottom:32px;">
                <div style="width:68px;height:68px;background:#EFF6FF;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#034C81;border:1px solid rgba(3,76,129,0.15);">
                  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h1 style="font-size:24px;font-weight:800;color:#1A1A1A;margin-bottom:6px;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Crear Cuenta</h1>
                <p style="font-size:14px;color:#666;font-family:'Poppins',sans-serif;">¿Cómo vas a usar HolaDoc!?</p>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                <a href="#/register/patient" id="register-as-patient"
                  style="background:#fff;border:2px solid #E0E0E0;border-radius:10px;padding:28px 20px;text-align:center;text-decoration:none;cursor:pointer;transition:all .25s;display:flex;flex-direction:column;align-items:center;gap:12px;"
                  onmouseover="this.style.borderColor='#034C81';this.style.background='#EFF6FF';this.style.transform='translateY(-3px)'"
                  onmouseout="this.style.borderColor='#E0E0E0';this.style.background='#fff';this.style.transform='translateY(0)'">
                  <div style="width:56px;height:56px;background:#EFF6FF;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#034C81;">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <div style="font-size:16px;font-weight:800;color:#1A1A1A;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:0.3px;">Soy Paciente</div>
                    <div style="font-size:12px;color:#666;font-family:'Poppins',sans-serif;margin-top:4px;line-height:1.5;">Solicitá recetas, turnos<br>y consultá tus estudios.</div>
                  </div>
                </a>
                <a href="#/register/doctor" id="register-as-doctor"
                  style="background:#fff;border:2px solid #E0E0E0;border-radius:10px;padding:28px 20px;text-align:center;text-decoration:none;cursor:pointer;transition:all .25s;display:flex;flex-direction:column;align-items:center;gap:12px;"
                  onmouseover="this.style.borderColor='#034C81';this.style.background='#EFF6FF';this.style.transform='translateY(-3px)'"
                  onmouseout="this.style.borderColor='#E0E0E0';this.style.background='#fff';this.style.transform='translateY(0)'">
                  <div style="width:56px;height:56px;background:#EFF6FF;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#034C81;">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                  </div>
                  <div>
                    <div style="font-size:16px;font-weight:800;color:#1A1A1A;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:0.3px;">Soy Médico</div>
                    <div style="font-size:12px;color:#666;font-family:'Poppins',sans-serif;margin-top:4px;line-height:1.5;">Gestioná pacientes,<br>recetas y agenda.</div>
                  </div>
                </a>
              </div>

              <div style="text-align:center;">
                <p style="font-size:13px;color:#666;font-family:'Poppins',sans-serif;">
                  ¿Ya tenés cuenta?
                  <a href="#/login" style="color:#034C81;font-weight:700;text-decoration:none;margin-left:4px;">Ingresá acá</a>
                </p>
              </div>
            </div>
            `);
        },

        // ── PATIENT REGISTER ─────────────────────────────────────
        renderPatientRegister(container) {
            container.innerHTML = authPageHTML(authCard(
                'Registro de Paciente',
                'Ingresá tus datos personales para crear tu cuenta',
                `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
                `
                ${errorBox('reg-dni-error')}
                <form id="patient-register-form">
                  ${field('reg-dni', 'DNI', 'number', 'Ej: 11111111', true, 'pattern="[0-9]{7,8}" inputmode="numeric"')}
                  ${field('reg-name', 'Nombre y Apellido', 'text', 'Ej: Juan Pérez')}
                  ${field('reg-phone', 'Celular o Teléfono', 'tel', 'Ej: 1122334455', false)}
                  ${field('reg-birth', 'Fecha de Nacimiento', 'date', '', true)}
                  ${field('reg-obrasocial', 'Obra Social o Prepaga', 'text', 'Ej: PAMI, OSDE, Medifé')}
                  ${field('reg-nroafiliado', 'Número de Afiliado', 'text', 'Ej: 9876543210')}
                  ${submitBtn('Crear Mi Cuenta')}
                </form>
                <div style="margin-top:20px;text-align:center;">
                  <a href="#/register" style="font-size:13px;color:#666;font-family:'Poppins',sans-serif;text-decoration:none;">← Volver</a>
                </div>
                `
            ));

            const form = document.getElementById('patient-register-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const dni = document.getElementById('reg-dni').value.trim();
                const name = document.getElementById('reg-name').value.trim();
                const phone = document.getElementById('reg-phone').value.trim();
                const birthDate = document.getElementById('reg-birth').value;
                const obraSocial = document.getElementById('reg-obrasocial').value.trim();
                const nroAfiliado = document.getElementById('reg-nroafiliado').value.trim();
                const errorDiv = document.getElementById('reg-dni-error');
                errorDiv.style.display = 'none';

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.style.display = 'block';
                    return;
                }

                const success = await window.HolaDocStorage.savePatient({ dni, name, phone, birthDate, obraSocial, nroAfiliado });
                if (success) {
                    await this.login(dni);
                    window.HolaDocApp.showToast('¡Registro de paciente exitoso!', 'success');
                    window.HolaDocApp.navigate('/patient');
                } else {
                    errorDiv.textContent = 'Este DNI ya está registrado. Intentá ingresar.';
                    errorDiv.style.display = 'block';
                }
            });
        },

        // ── DOCTOR REGISTER ──────────────────────────────────────
        renderDoctorRegister(container) {
            container.innerHTML = authPageHTML(authCard(
                'Registro de Médico',
                'Ingresá tus datos profesionales para crear tu cuenta',
                `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`,
                `
                ${errorBox('reg-dni-error')}
                <form id="doctor-register-form">
                  ${field('reg-dni', 'DNI', 'number', 'Ej: 99999999', true, 'pattern="[0-9]{7,8}" inputmode="numeric"')}
                  ${field('reg-name', 'Nombre completo (con Dr./Dra.)', 'text', 'Ej: Dra. Silvia Pérez')}
                  ${field('reg-matricula', 'Matrícula Nacional/Provincial', 'text', 'Ej: MN12345')}
                  ${selectField('reg-specialty', 'Especialidad', SPECIALTIES)}
                  ${field('reg-phone', 'Celular o Teléfono de contacto', 'tel', 'Ej: 1122334455', false)}
                  ${submitBtn('Crear Mi Cuenta Profesional')}
                </form>
                <div style="margin-top:20px;text-align:center;">
                  <a href="#/register" style="font-size:13px;color:#666;font-family:'Poppins',sans-serif;text-decoration:none;">← Volver</a>
                </div>
                `
            ));

            const form = document.getElementById('doctor-register-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const dni = document.getElementById('reg-dni').value.trim();
                const name = document.getElementById('reg-name').value.trim();
                const matricula = document.getElementById('reg-matricula').value.trim();
                const specialty = document.getElementById('reg-specialty').value;
                const phone = document.getElementById('reg-phone').value.trim();
                const errorDiv = document.getElementById('reg-dni-error');
                errorDiv.style.display = 'none';

                if (!/^[0-9]{7,8}$/.test(dni)) {
                    errorDiv.textContent = 'El DNI debe tener 7 u 8 números.';
                    errorDiv.style.display = 'block';
                    return;
                }

                const schedule = {
                    lunes:     { active: true,  start: '08:00', end: '16:00' },
                    martes:    { active: true,  start: '08:00', end: '16:00' },
                    miercoles: { active: true,  start: '08:00', end: '16:00' },
                    jueves:    { active: true,  start: '08:00', end: '16:00' },
                    viernes:   { active: true,  start: '08:00', end: '16:00' },
                    sabado:    { active: false, start: '09:00', end: '12:00' },
                    domingo:   { active: false, start: '09:00', end: '12:00' }
                };

                const success = await window.HolaDocStorage.saveDoctor({ dni, name, matricula, specialty, phone, schedule, consultationDuration: '30' });
                if (success) {
                    await this.login(dni);
                    window.HolaDocApp.showToast('¡Registro profesional exitoso!', 'success');
                    window.HolaDocApp.navigate('/doctor');
                } else {
                    errorDiv.textContent = 'Este DNI ya está registrado. Intentá ingresar.';
                    errorDiv.style.display = 'block';
                }
            });
        },

        async login(dni) {
            let user = await window.HolaDocStorage.getPatient(dni);
            if (!user) user = await window.HolaDocStorage.getDoctor(dni);
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
