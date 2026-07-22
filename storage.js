/**
 * Tu Doctor de Cabecera — Hybrid Data Storage and Persistence layer
 * Connected to API with fast 2-second timeout and automatic LocalStorage fallback.
 */
(function() {
    'use strict';

    const API_BASE = '/api';

    // Local Storage Fallback Helpers
    function getLS(key, defaultValue = []) {
        try {
            const data = localStorage.getItem('tdc_' + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function setLS(key, value) {
        try {
            localStorage.setItem('tdc_' + key, JSON.stringify(value));
        } catch (e) {}
    }

    async function apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        options.signal = controller.signal;

        try {
            const response = await fetch(API_BASE + endpoint, options);
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Error HTTP ' + response.status);
            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);
            // LocalStorage Fallback logic
            return handleLSFallback(endpoint, method, data);
        }
    }

    function handleLSFallback(endpoint, method, data) {
        // Patients
        if (endpoint === '/patients' && method === 'GET') return getLS('patients', []);
        if (endpoint.startsWith('/patients/') && method === 'GET') {
            const dni = decodeURIComponent(endpoint.split('/patients/')[1]);
            return getLS('patients', []).find(p => p.dni === dni) || null;
        }
        if (endpoint === '/patients' && method === 'POST') {
            const list = getLS('patients', []);
            if (list.some(p => p.dni === data.dni)) throw new Error('DNI existente');
            list.push(data);
            setLS('patients', list);
            return data;
        }
        if (endpoint.startsWith('/patients/') && method === 'PUT') {
            const dni = decodeURIComponent(endpoint.split('/patients/')[1]);
            const list = getLS('patients', []);
            const idx = list.findIndex(p => p.dni === dni);
            if (idx !== -1) {
                list[idx] = { ...list[idx], ...data };
                setLS('patients', list);
                return list[idx];
            }
            return null;
        }

        // Doctors
        if (endpoint === '/doctors' && method === 'GET') return getLS('doctors', []);
        if (endpoint.startsWith('/doctors/') && method === 'GET') {
            const dni = decodeURIComponent(endpoint.split('/doctors/')[1]);
            return getLS('doctors', []).find(d => d.dni === dni) || null;
        }
        if (endpoint === '/doctors' && method === 'POST') {
            const list = getLS('doctors', []);
            if (list.some(d => d.dni === data.dni)) throw new Error('DNI existente');
            list.push(data);
            setLS('doctors', list);
            return data;
        }

        // Appointments
        if (endpoint.startsWith('/appointments') && method === 'GET') {
            return getLS('appointments', []);
        }
        if (endpoint === '/appointments' && method === 'POST') {
            const list = getLS('appointments', []);
            data.id = data.id || 'app_' + Date.now();
            list.push(data);
            setLS('appointments', list);
            return data;
        }

        // Requests
        if (endpoint.startsWith('/requests') && method === 'GET') {
            return getLS('requests', []);
        }
        if (endpoint === '/requests' && method === 'POST') {
            const list = getLS('requests', []);
            data.id = data.id || 'req_' + Date.now();
            list.push(data);
            setLS('requests', list);
            return data;
        }

        // Default fallback
        if (method === 'GET') return [];
        return data || { success: true };
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
                await apiRequest('/patients', 'POST', data);
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
            try {
                sessionStorage.setItem('holadoc_session', JSON.stringify(user));
            } catch (e) {}
        },

        getCurrentUser() {
            try {
                const session = sessionStorage.getItem('holadoc_session');
                if (!session) return null;
                const user = JSON.parse(session);
                if (user && user.dni && user.type) return user;
                sessionStorage.removeItem('holadoc_session');
                return null;
            } catch (e) {
                sessionStorage.removeItem('holadoc_session');
                return null;
            }
        },

        clearCurrentUser() {
            try {
                sessionStorage.removeItem('holadoc_session');
            } catch (e) {}
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
            // Self-managed
        }
    };
})();
