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
            { route: '#/patient/salud', icon: '📊', label: 'Salud', key: '/patient/salud' },
            { route: '#/patient/historia', icon: '📋', label: 'Solicitudes', key: '/patient/historia' },
            { route: '#/patient/notificaciones', icon: '🔔', label: 'Alertas', key: '/patient/notificaciones' },
        ];
        return items.map(item => {
            const isActive = activeRoute === item.key;
            const unreadBadge = item.key === '/patient/notificaciones' ? getNotificationBadge() : '';
            return `
                <a href="${item.route}" class="bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}" id="nav-${item.key.replace(/\//g, '-')}">
                    <span class="nav-icon">${item.icon}${unreadBadge}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
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
                <a href="${item.route}" class="bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}" id="nav-${item.key.replace(/\//g, '-')}">
                    <span class="nav-icon">${item.icon}${unreadBadge}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
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
        const isDoctor = user.type === 'doctor';
        const baseRoute = route.split('/').slice(0, 3).join('/');

        app.innerHTML = `
            <!-- Top Navbar -->
            <nav class="navbar" id="main-navbar">
                <div class="navbar-brand" id="navbar-brand">
                    <span class="brand-icon">🏥</span>
                    <span class="brand-text">HolaDoc!</span>
                </div>
                <div class="navbar-actions">
                    <div class="notification-bell" id="navbar-bell">
                        🔔${getNotificationBadge()}
                    </div>
                    <div class="navbar-user" id="navbar-user">
                        <div class="avatar" title="${user.name}">
                            ${getInitials(user.name)}
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content Area -->
            <main class="main-content" id="page-content"></main>

            <!-- Bottom Navigation -->
            <nav class="bottom-nav" id="bottom-nav">
                ${isPatient ? getPatientNav(route) : getDoctorNav(route)}
            </nav>

            <!-- User Menu Dropdown (hidden by default) -->
            <div class="user-menu hidden" id="user-menu">
                <div class="user-menu-header">
                    <div class="avatar avatar-lg">${getInitials(user.name)}</div>
                    <div class="user-menu-info">
                        <div class="user-menu-name">${user.name}</div>
                        <div class="user-menu-role">${isPatient ? 'Paciente' : 'Médico'}</div>
                        <div class="user-menu-dni">DNI: ${user.dni}</div>
                    </div>
                </div>
                <div class="user-menu-divider"></div>
                <button class="user-menu-item" id="btn-logout">
                    <span>🚪</span> Cerrar Sesión
                </button>
            </div>
        `;

        // Attach navbar event listeners
        setupNavbarListeners(user);

        return document.getElementById('page-content');
    }

    function setupNavbarListeners(user) {
        // Brand click -> home
        const brand = document.getElementById('navbar-brand');
        if (brand) {
            brand.addEventListener('click', () => {
                navigate(user.type === 'patient' ? '/patient' : '/doctor');
            });
        }

        // Bell click -> notifications
        const bell = document.getElementById('navbar-bell');
        if (bell) {
            bell.addEventListener('click', () => {
                navigate(user.type === 'patient' ? '/patient/notificaciones' : '/doctor/notificaciones');
            });
        }

        // User avatar -> toggle menu
        const userBtn = document.getElementById('navbar-user');
        const userMenu = document.getElementById('user-menu');
        if (userBtn && userMenu) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', () => {
                userMenu.classList.add('hidden');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.HolaDocNotifications) {
                    window.HolaDocNotifications.destroy();
                }
                window.HolaDocAuth.logout();
                navigate('/login');
                showToast('Sesión cerrada', 'info');
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
            const href = item.getAttribute('href');
            const itemRoute = href ? href.replace('#', '') : '';
            item.classList.toggle('bottom-nav-item--active', itemRoute === route);
        });
    }

    // ── Landing Page ───────────────────────────────────────────
    function renderLanding(container) {
        container.innerHTML = `
            <div class="landing-page">
                <div class="landing-bg">
                    <div class="landing-circle landing-circle-1"></div>
                    <div class="landing-circle landing-circle-2"></div>
                    <div class="landing-circle landing-circle-3"></div>
                </div>
                <div class="landing-content fade-in">
                    <div class="landing-hero">
                        <div class="landing-logo float">
                            <span class="landing-logo-icon">🏥</span>
                        </div>
                        <h1 class="landing-title">HolaDoc!</h1>
                        <p class="landing-subtitle">Tu salud, más simple</p>
                        <p class="landing-description">
                            Gestioná turnos, recetas, derivaciones y más<br>
                            desde tu celular. Simple y rápido.
                        </p>
                    </div>

                    <div class="landing-features slide-up">
                        <div class="landing-feature">
                            <span class="landing-feature-icon">📅</span>
                            <span class="landing-feature-text">Turnos al instante</span>
                        </div>
                        <div class="landing-feature">
                            <span class="landing-feature-icon">💊</span>
                            <span class="landing-feature-text">Recetas digitales</span>
                        </div>
                        <div class="landing-feature">
                            <span class="landing-feature-icon">📊</span>
                            <span class="landing-feature-text">Seguimiento de salud</span>
                        </div>
                        <div class="landing-feature">
                            <span class="landing-feature-icon">🔔</span>
                            <span class="landing-feature-text">Notificaciones en tiempo real</span>
                        </div>
                    </div>

                    <div class="landing-actions slide-up" style="animation-delay: 0.2s;">
                        <a href="#/login" class="btn btn-primary btn-lg btn-block" id="landing-login-btn">
                            INGRESAR
                        </a>
                        <a href="#/register" class="btn btn-outline btn-lg btn-block" id="landing-register-btn" style="margin-top: 12px;">
                            CREAR CUENTA
                        </a>
                    </div>

                    <p class="landing-footer text-muted" style="margin-top: 32px; font-size: 15px;">
                        Ingresá solo con tu DNI. Sin contraseñas.
                    </p>
                </div>
            </div>
        `;
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
