/**
 * HolaDoc! — App Router & Main Controller
 * Handles SPA routing, layout rendering, and module coordination.
 * All text in Spanish.
 */
(function () {
    'use strict';

    // ── Route Definitions ──────────────────────────────────────
    const ROUTES = {
        '/': 'landing',
        '/login': 'login',
        '/register': 'register',
        '/register/patient': 'registerPatient',
        '/register/doctor': 'registerDoctor',
        '/patient': 'patientDashboard',
        '/patient/turno': 'patientAppointment',
        '/patient/receta': 'patientReceta',
        '/patient/derivacion': 'patientDerivacion',
        '/patient/estudio': 'patientEstudio',
        '/patient/internacion': 'patientInternacion',
        '/patient/salud': 'patientHealth',
        '/patient/historia': 'patientHistory',
        '/patient/notificaciones': 'patientNotifications',
        '/patient/solicitud': 'patientRequestDetail',
        '/doctor': 'doctorDashboard',
        '/doctor/agenda': 'doctorSchedule',
        '/doctor/pacientes': 'doctorPatients',
        '/doctor/paciente': 'doctorPatientDetail',
        '/doctor/solicitudes': 'doctorRequests',
        '/doctor/notificaciones': 'doctorNotifications',
    };

    // ── Patient Bottom Nav ─────────────────────────────────────
    function getPatientNav(activeRoute) {
        const items = [
            { route: '#/patient', icon: '🏠', label: 'Inicio', key: '/patient' },
            { route: '#/patient/salud', icon: '📊', label: 'Mi Salud', key: '/patient/salud' },
            { route: '#/patient/historia', icon: '📋', label: 'Historial', key: '/patient/historia' },
            { route: '#/patient/notificaciones', icon: '🔔', label: 'Alertas', key: '/patient/notificaciones' },
        ];
        return items.map(item => {
            const isActive = activeRoute === item.key;
            const unreadBadge = item.key === '/patient/notificaciones' ? getNotificationBadge() : '';
            return `
                <button class="bottom-nav-item ${isActive ? 'active' : ''}" data-route="${item.key}" id="nav-${item.key.replace(/\//g, '-')}">
                    <span class="bottom-nav-icon">${item.icon}${unreadBadge}</span>
                    <span class="bottom-nav-label">${item.label}</span>
                </button>
            `;
        }).join('');
    }

    // ── Doctor Bottom Nav ──────────────────────────────────────
    function getDoctorNav(activeRoute) {
        const items = [
            { route: '#/doctor', icon: '🏠', label: 'Inicio', key: '/doctor' },
            { route: '#/doctor/agenda', icon: '📅', label: 'Agenda', key: '/doctor/agenda' },
            { route: '#/doctor/pacientes', icon: '👥', label: 'Pacientes', key: '/doctor/pacientes' },
            { route: '#/doctor/solicitudes', icon: '📋', label: 'Solicitudes', key: '/doctor/solicitudes' },
            { route: '#/doctor/notificaciones', icon: '🔔', label: 'Alertas', key: '/doctor/notificaciones' },
        ];
        return items.map(item => {
            const isActive = activeRoute === item.key;
            const unreadBadge = item.key === '/doctor/notificaciones' ? getNotificationBadge() : '';
            return `
                <button class="bottom-nav-item ${isActive ? 'active' : ''}" data-route="${item.key}" id="nav-${item.key.replace(/\//g, '-')}">
                    <span class="bottom-nav-icon">${item.icon}${unreadBadge}</span>
                    <span class="bottom-nav-label">${item.label}</span>
                </button>
            `;
        }).join('');
    }

    function getNotificationBadge() {
        const user = window.HolaDocStorage.getCurrentUser();
        if (!user) return '';
        const count = window.HolaDocStorage.getUnreadCount(user.dni, user.type);
        if (count === 0) return '';
        return `<span class="notification-badge nav-badge">${count > 9 ? '9+' : count}</span>`;
    }

    // ── Layout Renderer ────────────────────────────────────────
    function renderLayout(route) {
        const app = document.getElementById('app');
        const user = window.HolaDocStorage.getCurrentUser();

        // Public routes (no layout)
        const publicRoutes = ['/', '/login', '/register', '/register/patient', '/register/doctor'];
        if (publicRoutes.includes(route)) {
            app.innerHTML = `<div id="page-content" class="public-page"></div>`;
            return document.getElementById('page-content');
        }

        // Check auth
        if (!user) {
            window.location.hash = '#/login';
            return null;
        }

        const isPatient = user.type === 'patient';
        const isDoctor  = user.type === 'doctor';

        // Apply background
        document.body.style.backgroundImage = isPatient ? "url('img/bg_patient.png')" : "url('img/bg_doctor.png')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";

        if (isDoctor) {
            document.body.classList.add('dark-bg-theme');
        } else {
            document.body.classList.remove('dark-bg-theme');
        }

        app.style.background = 'transparent';

        app.innerHTML = `
            <!-- Panel Header (dark bar) -->
            <header class="panel-header" id="panel-header">
                <div class="panel-header-inner">
                    <div>
                        <div class="panel-header-logo" id="panel-logo">Hola<em>Doc!</em></div>
                        <div class="panel-user-name">${isPatient ? '👤 Paciente' : '🩺 Médico'} — ${user.name}</div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center">
                        <button class="panel-logout" id="navbar-bell" title="Notificaciones" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.15)">
                            🔔${getNotificationBadge()}
                        </button>
                        <button class="panel-logout" id="btn-logout">Salir</button>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="main-content" id="page-content" style="background: transparent !important;"></main>

            <!-- Bottom Navigation -->
            <nav class="bottom-nav" id="bottom-nav">
                ${isPatient ? getPatientNav(route) : getDoctorNav(route)}
            </nav>
        `;

        // Attach panel event listeners
        setupNavbarListeners(user);

        return document.getElementById('page-content');
    }

    function setupNavbarListeners(user) {
        // Logo click -> home
        const logo = document.getElementById('panel-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => navigate(user.type === 'patient' ? '/patient' : '/doctor'));
        }

        // Bell click -> notifications
        const bell = document.getElementById('navbar-bell');
        if (bell) {
            bell.addEventListener('click', () => {
                navigate(user.type === 'patient' ? '/patient/notificaciones' : '/doctor/notificaciones');
            });
        }

        // Bottom nav buttons
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.querySelectorAll('.bottom-nav-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const route = btn.dataset.route;
                    if (route) navigate(route);
                });
            });
        }

        // Logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.HolaDocNotifications) window.HolaDocNotifications.destroy();
                window.HolaDocAuth.logout();
                navigate('/login');
                showToast('Sesión cerrada correctamente', 'info');
            });
        }
    }

    // ── Route Handler ──────────────────────────────────────────
    function handleRoute() {
        const hash = window.location.hash.replace('#', '') || '/';
        const parts = hash.split('/').filter(Boolean);

        // Determine route and params
        let route = '/' + parts.join('/');
        let params = {};

        // Extract dynamic params
        // /doctor/paciente/12345678 -> route=/doctor/paciente, params.dni=12345678
        if (parts[0] === 'doctor' && parts[1] === 'paciente' && parts[2]) {
            route = '/doctor/paciente';
            params.dni = parts[2];
            params.tab = parts[3] || 'historia';
        }
        // /patient/solicitud/req_123 -> route=/patient/solicitud, params.id=req_123
        if (parts[0] === 'patient' && parts[1] === 'solicitud' && parts[2]) {
            route = '/patient/solicitud';
            params.id = parts[2];
        }

        const container = renderLayout(route);
        if (!container) return;

        // Route to handler
        const routeKey = ROUTES[route];
        switch (routeKey) {
            // ── Public ──
            case 'landing':
                renderLanding(container);
                break;
            case 'login':
                window.HolaDocAuth.renderLogin(container);
                break;
            case 'register':
                window.HolaDocAuth.renderRegister(container);
                break;
            case 'registerPatient':
                window.HolaDocAuth.renderPatientRegister(container);
                break;
            case 'registerDoctor':
                window.HolaDocAuth.renderDoctorRegister(container);
                break;

            // ── Patient ──
            case 'patientDashboard':
                window.HolaDocPatient.renderDashboard(container);
                break;
            case 'patientAppointment':
                window.HolaDocPatient.renderAppointment(container);
                break;
            case 'patientReceta':
                window.HolaDocPatient.renderRequest(container, 'receta');
                break;
            case 'patientDerivacion':
                window.HolaDocPatient.renderRequest(container, 'derivacion');
                break;
            case 'patientEstudio':
                window.HolaDocPatient.renderRequest(container, 'estudio');
                break;
            case 'patientInternacion':
                window.HolaDocPatient.renderRequest(container, 'internacion');
                break;
            case 'patientHealth':
                window.HolaDocPatient.renderHealth(container);
                break;
            case 'patientHistory':
                window.HolaDocPatient.renderHistory(container);
                break;
            case 'patientNotifications':
                if (window.HolaDocNotifications) {
                    window.HolaDocNotifications.renderPage(container);
                }
                break;
            case 'patientRequestDetail':
                window.HolaDocPatient.renderRequestDetail(container, params.id);
                break;

            // ── Doctor ──
            case 'doctorDashboard':
                window.HolaDocDoctor.renderDashboard(container);
                break;
            case 'doctorSchedule':
                window.HolaDocDoctor.renderSchedule(container);
                break;
            case 'doctorPatients':
                window.HolaDocDoctor.renderPatients(container);
                break;
            case 'doctorPatientDetail':
                window.HolaDocDoctor.renderPatientDetail(container, params.dni, params.tab);
                break;
            case 'doctorRequests':
                window.HolaDocDoctor.renderRequests(container);
                break;
            case 'doctorNotifications':
                if (window.HolaDocNotifications) {
                    window.HolaDocNotifications.renderPage(container);
                }
                break;

            default:
                render404(container);
                break;
        }

        // Update bottom nav active state
        updateBottomNav(route);

        // Start notification polling for logged-in users
        const user = window.HolaDocStorage.getCurrentUser();
        if (user && window.HolaDocNotifications) {
            window.HolaDocNotifications.init(user.dni, user.type);
        }
    }

    function updateBottomNav(route) {
        const bottomNav = document.getElementById('bottom-nav');
        if (!bottomNav) return;
        const items = bottomNav.querySelectorAll('.bottom-nav-item');
        items.forEach(item => {
            const itemRoute = item.dataset.route || '';
            item.classList.toggle('active', itemRoute === route);
        });
    }

    // ── Landing Page (Estilo Apicona) ──────────────────────────
    function renderLanding(container) {
        container.innerHTML = `
        <div class="landing-wrapper">

          <!-- TOPBAR -->
          <div class="topbar">
            <div class="topbar-inner">
              <div class="topbar-left">
                <div class="topbar-item"><span>📞</span> 0800-999-HOLA</div>
                <div class="topbar-item"><span>✉️</span> contacto@holadoc.com.ar</div>
                <div class="topbar-item"><span>🕐</span> Lun–Vie 8:00–20:00</div>
              </div>
              <div class="topbar-right">
                <a href="#" class="topbar-social" title="Facebook">f</a>
                <a href="#" class="topbar-social" title="Instagram">ig</a>
                <a href="#" class="topbar-social" title="Twitter/X">x</a>
              </div>
            </div>
          </div>

          <!-- NAVBAR -->
          <nav class="navbar" id="landing-navbar">
            <div class="navbar-inner">
              <a href="#/" class="navbar-logo">
                <div class="logo-icon-wrap">🏥</div>
                <span class="logo-text">Hola<span>Doc!</span></span>
              </a>
              <div class="navbar-links">
                <button class="nav-link" onclick="document.getElementById('services-section').scrollIntoView({behavior:'smooth'})">Servicios</button>
                <button class="nav-link" onclick="document.getElementById('about-section').scrollIntoView({behavior:'smooth'})">Nosotros</button>
                <button class="nav-link" onclick="document.getElementById('team-section').scrollIntoView({behavior:'smooth'})">Equipo</button>
                <button class="nav-link" onclick="document.getElementById('contact-section').scrollIntoView({behavior:'smooth'})">Contacto</button>
              </div>
              <div class="navbar-cta">
                <a href="#/login" class="btn btn-outline-dark btn-sm" id="landing-login-btn">Iniciar Sesión</a>
                <a href="#/register" class="btn btn-primary btn-sm" id="landing-register-btn">Registrarse</a>
              </div>
              <button class="hamburger" id="land-hamburger" aria-label="Menú">
                <span></span><span></span><span></span>
              </button>
            </div>
          </nav>

          <!-- HERO SLIDER -->
          <section class="hero-section" id="hero-section">
            <div class="hero-slides" id="hero-slides">
              <div class="hero-slide active" id="slide-0">
                <img src="img/hero1.png" alt="Equipo médico profesional HolaDoc!" />
              </div>
              <div class="hero-slide" id="slide-1">
                <img src="img/hero2.png" alt="Atención personalizada a pacientes" />
              </div>
            </div>
            <div class="hero-content">
              <div class="hero-label">Plataforma de Salud Digital</div>
              <h1 class="hero-title">Tu salud, <em>más simple</em><br>que nunca</h1>
              <p class="hero-subtitle">
                Gestioná turnos, recetas digitales, derivaciones y tu historia clínica
                desde cualquier dispositivo. Rápido, seguro y sin filas.
              </p>
              <div class="hero-actions">
                <a href="#/login" class="btn btn-primary btn-lg" id="hero-login-btn">Ingresar Ahora</a>
                <button class="btn btn-outline btn-lg" style="color:#fff;border-color:rgba(255,255,255,0.5)" onclick="document.getElementById('services-section').scrollIntoView({behavior:'smooth'})">Ver Servicios</button>
              </div>
            </div>
            <div class="hero-dots" id="hero-dots">
              <button class="hero-dot active" data-slide="0"></button>
              <button class="hero-dot" data-slide="1"></button>
            </div>
          </section>

          <!-- SERVICES SECTION -->
          <section class="services-section" id="services-section">
            <div class="section-header">
              <span class="section-label">Nuestros Servicios</span>
              <h2>Todo lo que necesitás,<br>en un solo lugar</h2>
              <p>Accedé a los servicios de salud más importantes de forma digital, rápida y segura.</p>
            </div>
            <div class="services-grid">
              <div class="service-card card-dark">
                <div class="service-card-icon">📅</div>
                <h3>Turnos Online</h3>
                <p>Reservá turnos con tu médico en segundos, sin llamadas ni esperas. Recibís confirmación instantánea.</p>
              </div>
              <div class="service-card card-red">
                <div class="service-card-icon">💊</div>
                <h3>Receta Digital</h3>
                <p>Tu médico emite recetas digitales con validez oficial. Presentalas en cualquier farmacia de la red.</p>
              </div>
              <div class="service-card card-dark">
                <div class="service-card-icon">📋</div>
                <h3>Historia Clínica</h3>
                <p>Accedé a toda tu historia clínica, estudios y diagnósticos desde cualquier lugar, en cualquier momento.</p>
              </div>
            </div>
          </section>

          <!-- ABOUT SECTION -->
          <section class="about-section" id="about-section">
            <div class="about-inner">
              <div class="about-image-wrap">
                <img src="img/about.png" alt="Médico atendiendo a paciente en consultorio" />
                <div class="about-badge">
                  <div class="badge-num">+15</div>
                  <div class="badge-txt">Años de<br>experiencia</div>
                </div>
              </div>
              <div class="about-content">
                <span class="section-label">Quiénes Somos</span>
                <h2 style="margin-top:8px;margin-bottom:16px">Comprometidos con tu<br><em style="color:var(--primary);font-style:normal">salud y bienestar</em></h2>
                <p>HolaDoc! nació para simplificar el acceso a la salud en Argentina. Conectamos pacientes con médicos de forma digital, eliminando barreras y tiempos de espera.</p>
                <div class="about-features">
                  <div class="about-feature">
                    <div class="about-feat-icon">🏥</div>
                    <div>
                      <div class="about-feat-title">Red de Médicos Certificados</div>
                      <div class="about-feat-desc">Todos nuestros profesionales están matriculados y verificados.</div>
                    </div>
                  </div>
                  <div class="about-feature">
                    <div class="about-feat-icon">🔒</div>
                    <div>
                      <div class="about-feat-title">Datos 100% Seguros</div>
                      <div class="about-feat-desc">Tu información médica protegida con los más altos estándares.</div>
                    </div>
                  </div>
                  <div class="about-feature">
                    <div class="about-feat-icon">📱</div>
                    <div>
                      <div class="about-feat-title">Siempre Disponible</div>
                      <div class="about-feat-desc">Accedé desde cualquier dispositivo, las 24 horas del día.</div>
                    </div>
                  </div>
                </div>
                <div style="margin-top:28px">
                  <a href="#/register" class="btn btn-primary">Comenzar Ahora</a>
                </div>
              </div>
            </div>
          </section>

          <!-- STATS BAR -->
          <section class="stats-bar">
            <div class="stats-bar-inner">
              <div class="stat-item-land">
                <div class="stat-num">50K+</div>
                <div class="stat-txt">Pacientes Registrados</div>
              </div>
              <div class="stat-item-land">
                <div class="stat-num">1.2K</div>
                <div class="stat-txt">Médicos en la Red</div>
              </div>
              <div class="stat-item-land">
                <div class="stat-num">98%</div>
                <div class="stat-txt">Satisfacción</div>
              </div>
              <div class="stat-item-land">
                <div class="stat-num">24/7</div>
                <div class="stat-txt">Disponibilidad</div>
              </div>
            </div>
          </section>

          <!-- TEAM GALLERY -->
          <section class="gallery-section" id="team-section">
            <div class="section-header">
              <span class="section-label">Nuestro Equipo</span>
              <h2>Profesionales dedicados<br>a tu salud</h2>
            </div>
            <div class="gallery-grid">
              <div class="gallery-item">
                <img src="img/hero1.png" alt="Dra. Martínez - Clínica General" />
                <div class="gallery-overlay">
                  <div class="gallery-name">Dra. Ana Martínez</div>
                  <div class="gallery-role">Clínica General</div>
                </div>
              </div>
              <div class="gallery-item">
                <img src="img/about.png" alt="Dr. Rodríguez - Cardiología" />
                <div class="gallery-overlay">
                  <div class="gallery-name">Dr. Carlos Rodríguez</div>
                  <div class="gallery-role">Cardiología</div>
                </div>
              </div>
              <div class="gallery-item">
                <img src="img/hero2.png" alt="Dra. López - Pediatría" />
                <div class="gallery-overlay">
                  <div class="gallery-name">Dra. Laura López</div>
                  <div class="gallery-role">Pediatría</div>
                </div>
              </div>
              <div class="gallery-item">
                <img src="img/hero1.png" alt="Dr. González - Traumatología" />
                <div class="gallery-overlay">
                  <div class="gallery-name">Dr. Martín González</div>
                  <div class="gallery-role">Traumatología</div>
                </div>
              </div>
            </div>
          </section>

          <!-- CONTACT CTA -->
          <section style="padding:72px 24px;background:var(--primary);text-align:center" id="contact-section">
            <div style="max-width:600px;margin:0 auto">
              <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.7)">Empezá Hoy</span>
              <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;color:#fff;margin:12px 0 16px;line-height:1.15">¿Listo para cuidar<br>tu salud con HolaDoc?</h2>
              <p style="color:rgba(255,255,255,0.8);font-size:16px;margin-bottom:32px">Registrate gratis y accedé a todos nuestros servicios de salud digital en minutos.</p>
              <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
                <a href="#/register" class="btn btn-lg" style="background:#fff;color:var(--primary);border-color:#fff;font-weight:700">Crear Cuenta Gratis</a>
                <a href="#/login" class="btn btn-lg" style="background:transparent;color:#fff;border-color:rgba(255,255,255,0.5)">Ya tengo cuenta</a>
              </div>
            </div>
          </section>

          <!-- FOOTER -->
          <footer class="footer">
            <div class="footer-inner">
              <div class="footer-top">
                <div class="footer-brand">
                  <div class="footer-logo">Hola<em>Doc!</em></div>
                  <p class="footer-desc">La plataforma de salud digital que conecta pacientes y médicos de Argentina de forma simple, segura y eficiente.</p>
                </div>
                <div class="footer-col">
                  <h4>Servicios</h4>
                  <div class="footer-links">
                    <a href="#/">Turnos Online</a>
                    <a href="#/">Recetas Digitales</a>
                    <a href="#/">Historia Clínica</a>
                    <a href="#/">Derivaciones</a>
                  </div>
                </div>
                <div class="footer-col">
                  <h4>Institucional</h4>
                  <div class="footer-links">
                    <a href="#/">Quiénes Somos</a>
                    <a href="#/">Nuestro Equipo</a>
                    <a href="#/">Obras Sociales</a>
                    <a href="#/">PAMI</a>
                  </div>
                </div>
                <div class="footer-col">
                  <h4>Contacto</h4>
                  <div class="footer-links">
                    <a href="#/">📞 0800-999-HOLA</a>
                    <a href="#/">✉️ contacto@holadoc.com.ar</a>
                    <a href="#/">📍 Buenos Aires, Argentina</a>
                  </div>
                </div>
              </div>
              <div class="footer-bottom">
                <span>© 2025 HolaDoc! — Todos los derechos reservados</span>
                <div class="footer-bottom-links">
                  <a href="#/">Privacidad</a>
                  <a href="#/">Términos</a>
                  <a href="#/">Cookies</a>
                </div>
              </div>
            </div>
          </footer>

        </div>
        `;

        // Hero slider logic
        let currentSlide = 0;
        const slides = container.querySelectorAll('.hero-slide');
        const dots   = container.querySelectorAll('.hero-dot');

        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        dots.forEach(dot => dot.addEventListener('click', () => goToSlide(+dot.dataset.slide)));
        const sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);

        // Navbar scroll shadow
        const landNav = container.querySelector('#landing-navbar');
        window.addEventListener('scroll', () => {
            if (landNav) landNav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // ── 404 Page ────────────────────────────────────────────────
    function render404(container) {
        container.innerHTML = `
            <div class="empty-state page-enter">
                <div class="empty-state-icon">🔍</div>
                <h2 class="empty-state-title">Página no encontrada</h2>
                <p class="empty-state-text">La página que buscás no existe.</p>
                <a href="#/" class="btn btn-primary mt-2">Volver al inicio</a>
            </div>
        `;
    }

    // ── Utility Functions ──────────────────────────────────────
    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .filter(w => w.length > 0)
            .slice(0, 2)
            .map(w => w[0].toUpperCase())
            .join('');
    }

    function navigate(route) {
        window.location.hash = '#' + route;
    }

    function showToast(message, type) {
        if (window.HolaDocNotifications && window.HolaDocNotifications.showToast) {
            window.HolaDocNotifications.showToast('', message, type || 'info');
        } else {
            // Fallback toast
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast toast-${type || 'info'}`;
            toast.innerHTML = `
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
            `;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
    }

    // ── Initialization ─────────────────────────────────────────
    function init() {
        // Seed demo data if first time
        if (window.HolaDocStorage) {
            window.HolaDocStorage.seedDemoData();
        }

        // Listen for hash changes
        window.addEventListener('hashchange', handleRoute);

        // Handle initial route
        if (!window.location.hash || window.location.hash === '#') {
            // Check if user is logged in
            const user = window.HolaDocStorage.getCurrentUser();
            if (user) {
                window.location.hash = user.type === 'patient' ? '#/patient' : '#/doctor';
            } else {
                window.location.hash = '#/';
            }
        }

        handleRoute();

        // Refresh nav badges periodically
        setInterval(() => {
            const bell = document.getElementById('navbar-bell');
            if (bell) {
                const user = window.HolaDocStorage.getCurrentUser();
                if (user) {
                    const count = window.HolaDocStorage.getUnreadCount(user.dni, user.type);
                    const badge = bell.querySelector('.notification-badge');
                    if (count > 0) {
                        if (badge) {
                            badge.textContent = count > 9 ? '9+' : count;
                        } else {
                            bell.innerHTML = `🔔<span class="notification-badge nav-badge">${count > 9 ? '9+' : count}</span>`;
                        }
                    } else if (badge) {
                        badge.remove();
                    }
                }
            }
        }, 5000);
    }

    // ── Expose Global API ──────────────────────────────────────
    window.HolaDocApp = {
        init: init,
        navigate: navigate,
        showToast: showToast,
        handleRoute: handleRoute,
        getInitials: getInitials,
    };

    // ── Auto-init on DOM ready ─────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
