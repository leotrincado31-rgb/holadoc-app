/**
 * HolaDoc! — Data Storage and Persistence layer
 * Connected to SQLite Backend REST API.
 */
(function() {
    'use strict';

    // ── Backend API Configuration ───────────────────────────────
    const API_BASE = '/api';

    async function apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(API_BASE + endpoint, options);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Error en la respuesta del servidor');
            }
            return await response.json();
        } catch (err) {
            console.warn(`[HolaDoc Storage] Error API ${method} ${endpoint}:`, err.message);
            // Return fallback default values if server is offline
            if (method === 'GET') return Array.isArray(data) ? [] : null;
            throw err;
        }
    }

    window.HolaDocStorage = {
        // ---- Users ----
        async getPatients() {
            const res = await apiRequest('/patients');
            return Array.isArray(res) ? res : [];
        },

        async getPatient(dni) {
            try {
                return await apiRequest('/patients/' + encodeURIComponent(dni));
            } catch (e) {
                return null;
            }
        },

        async savePatient(data) {
            try {
                const res = await apiRequest('/patients', 'POST', data);
                return true;
            } catch (e) {
                return false;
            }
        },

        async updatePatient(dni, updates) {
            try {
                return await apiRequest('/patients/' + encodeURIComponent(dni), 'PUT', updates);
            } catch (e) {
                return null;
            }
        },

        async getDoctors() {
            const res = await apiRequest('/doctors');
            return Array.isArray(res) ? res : [];
        },

        async getDoctor(dni) {
            try {
                return await apiRequest('/doctors/' + encodeURIComponent(dni));
            } catch (e) {
                return null;
            }
        },

        async saveDoctor(data) {
            try {
                await apiRequest('/doctors', 'POST', data);
                return true;
            } catch (e) {
                return false;
            }
        },

        async updateDoctor(dni, updates) {
            try {
                return await apiRequest('/doctors/' + encodeURIComponent(dni), 'PUT', updates);
            } catch (e) {
                return null;
            }
        },

        // ---- Session ----
        setCurrentUser(user) {
            sessionStorage.setItem('holadoc_session', JSON.stringify(user));
        },

        getCurrentUser() {
            const session = sessionStorage.getItem('holadoc_session');
            return session ? JSON.parse(session) : null;
        },

        clearCurrentUser() {
            sessionStorage.removeItem('holadoc_session');
        },

        // ---- Appointments ----
        async getAppointments(filters = {}) {
            const params = new URLSearchParams();
            if (filters.patientDni) params.append('patientDni', filters.patientDni);
            if (filters.doctorDni) params.append('doctorDni', filters.doctorDni);
            if (filters.date) params.append('date', filters.date);
            if (filters.status) params.append('status', filters.status);

            const query = params.toString() ? '?' + params.toString() : '';
            const res = await apiRequest('/appointments' + query);
            return Array.isArray(res) ? res : [];
        },

        async saveAppointment(data) {
            return await apiRequest('/appointments', 'POST', data);
        },

        async updateAppointment(id, updates) {
            return await apiRequest('/appointments/' + encodeURIComponent(id), 'PUT', updates);
        },

        // ---- Requests ----
        async getRequests(filters = {}) {
            const params = new URLSearchParams();
            if (filters.patientDni) params.append('patientDni', filters.patientDni);
            if (filters.doctorDni) params.append('doctorDni', filters.doctorDni);
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);

            const query = params.toString() ? '?' + params.toString() : '';
            const res = await apiRequest('/requests' + query);
            return Array.isArray(res) ? res : [];
        },

        async saveRequest(data) {
            return await apiRequest('/requests', 'POST', data);
        },

        async updateRequest(id, updates) {
            return await apiRequest('/requests/' + encodeURIComponent(id), 'PUT', updates);
        },

        // ---- Medical Records ----
        async getRecords(patientDni) {
            const res = await apiRequest('/records/' + encodeURIComponent(patientDni));
            return Array.isArray(res) ? res : [];
        },

        async saveRecord(data) {
            return await apiRequest('/records', 'POST', data);
        },

        // ---- Health Data ----
        async getHealthData(patientDni, days = 30) {
            const res = await apiRequest('/health/' + encodeURIComponent(patientDni) + '?days=' + days);
            return Array.isArray(res) ? res : [];
        },

        async saveHealthData(data) {
            return await apiRequest('/health', 'POST', data);
        },

        // ---- Notifications ----
        async getNotifications(userDni, userType) {
            const res = await apiRequest(`/notifications?userDni=${encodeURIComponent(userDni)}&userType=${encodeURIComponent(userType)}`);
            return Array.isArray(res) ? res : [];
        },

        async saveNotification(data) {
            return await apiRequest('/notifications', 'POST', data);
        },

        async markNotificationAsRead(id) {
            return await apiRequest('/notifications/' + encodeURIComponent(id) + '/read', 'PUT');
        },

        async getUnreadCount(userDni, userType) {
            const list = await this.getNotifications(userDni, userType);
            return list.filter(n => !n.read).length;
        },

        async markAllAsRead(userDni, userType) {
            return await apiRequest('/notifications/read-all', 'PUT', { userDni, userType });
        },

        // ---- Blocked Dates ----
        async getBlockedDates(doctorDni) {
            const res = await apiRequest('/blocked-dates/' + encodeURIComponent(doctorDni));
            return Array.isArray(res) ? res : [];
        },

        async saveBlockedDate(doctorDni, date) {
            return await apiRequest('/blocked-dates', 'POST', { doctorDni, date });
        },

        async removeBlockedDate(doctorDni, date) {
            return await apiRequest('/blocked-dates', 'DELETE', { doctorDni, date });
        },

        generateId(prefix) {
            return prefix + '_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
        },

        async seedDemoData() {
            // Managed directly by backend SQLite initDb()
        }
    };
})();
