/**
 * HolaDoc! — Notifications Module
 * Manages toast warnings, unread bell notification badge and notification center.
 */
(function() {
    'use strict';

    let pollInterval = null;
    let lastNotificationCount = 0;

    window.HolaDocNotifications = {
        async init(userDni, userType) {
            if (pollInterval) return;
            lastNotificationCount = await window.HolaDocStorage.getUnreadCount(userDni, userType);

            // Polling simulation every 4 seconds
            pollInterval = setInterval(async () => {
                await this.checkForNew(userDni, userType);
            }, 4000);
        },

        destroy() {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        },

        async checkForNew(userDni, userType) {
            const currentCount = await window.HolaDocStorage.getUnreadCount(userDni, userType);
            if (currentCount > lastNotificationCount) {
                const notifications = await window.HolaDocStorage.getNotifications(userDni, userType);
                const newest = notifications.find(n => !n.read);
                if (newest) {
                    this.showToast(newest.title, newest.message, newest.type || 'info');
                }

                // Update badge if rendered
                const badge = document.querySelector('#navbar-bell .notification-badge');
                if (badge) {
                    badge.textContent = currentCount > 9 ? '9+' : currentCount;
                }
            }
            lastNotificationCount = currentCount;
        },

        async renderBell(container) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;
            const count = await window.HolaDocStorage.getUnreadCount(user.dni, user.type);
            container.innerHTML = `
                🔔${count > 0 ? `<span class="notification-badge">${count > 9 ? '9+' : count}</span>` : ''}
            `;
        },

        async renderPage(container) {
            const user = window.HolaDocStorage.getCurrentUser();
            if (!user) return;

            const notifications = await window.HolaDocStorage.getNotifications(user.dni, user.type);
            await window.HolaDocStorage.markAllAsRead(user.dni, user.type);
            lastNotificationCount = 0;

            let notifListHTML = '';
            if (notifications.length === 0) {
                notifListHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔔</div>
                        <h3 class="empty-state-title">No tenés notificaciones</h3>
                        <p class="text-muted">Te avisaremos acá cuando haya novedades en tus solicitudes o turnos.</p>
                    </div>
                `;
            } else {
                notifListHTML = `
                    <div class="card" style="padding: 0; overflow: hidden;">
                        ${notifications.map(n => {
                            let icon = '🔔';
                            if (n.type === 'success') icon = '🟢';
                            if (n.type === 'warning') icon = '🟡';
                            if (n.type === 'error') icon = '🔴';

                            return `
                                <div class="list-item ${n.read ? '' : 'unread-notif'}" style="border-bottom: 1px solid var(--bg-secondary); padding: 20px; text-align: left; ${n.read ? '' : 'background: #F0F9FF;'}">
                                    <span style="font-size: 28px;">${icon}</span>
                                    <div class="list-item-content">
                                        <div class="list-item-title" style="font-size: 19px; font-weight:700;">${n.title}</div>
                                        <div class="list-item-subtitle" style="font-size: 17px; color: var(--text-secondary); margin-top:4px;">${n.message}</div>
                                        <div style="font-size: 14px; color: var(--text-muted); margin-top:8px;">${new Date(n.createdAt).toLocaleDateString('es-AR')} - ${new Date(n.createdAt).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="page-enter">
                    <div class="page-header">
                        <a href="#/${user.type}" class="page-back">← Volver al inicio</a>
                        <h1 class="page-title">Notificaciones</h1>
                        <p class="page-subtitle">Avisos y novedades en tiempo real</p>
                    </div>
                    ${notifListHTML}
                </div>
            `;
        },

        async createNotification(userDni, userType, type, title, message, relatedId = '') {
            await window.HolaDocStorage.saveNotification({
                userDni, userType, type, title, message, relatedId
            });
        },

        showToast(title, message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type} slide-in-right`;
            toast.innerHTML = `
                <div style="flex:1; text-align:left;">
                    ${title ? `<div style="font-weight:700; margin-bottom:4px;">${title}</div>` : ''}
                    <div style="font-size:16px;">${message}</div>
                </div>
                <button class="toast-close" style="background:transparent; border:none; color:white; font-size:18px; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
            `;
            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                setTimeout(() => toast.remove(), 400);
            }, 5000);
        }
    };
})();
