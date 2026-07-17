/**
 * HolaDoc! — Data Storage and Persistence layer
 * Uses localStorage to persist data between sessions.
 */
(function() {
    'use strict';

    const PREFIX = 'holadoc_';

    function get(key, defaultValue = []) {
        const value = localStorage.getItem(PREFIX + key);
        if (!value) return defaultValue;
        try {
            return JSON.parse(value);
        } catch (e) {
            return defaultValue;
        }
    }

    function set(key, value) {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }

    window.HolaDocStorage = {
        // ---- Users ----
        getPatients() {
            return get('patients');
        },

        getPatient(dni) {
            return this.getPatients().find(p => p.dni === dni) || null;
        },

        savePatient(data) {
            const patients = this.getPatients();
            if (patients.some(p => p.dni === data.dni)) return false;
            data.type = 'patient';
            data.createdAt = new Date().toISOString();
            patients.push(data);
            set('patients', patients);
            return true;
        },

        updatePatient(dni, updates) {
            const patients = this.getPatients();
            const index = patients.findIndex(p => p.dni === dni);
            if (index === -1) return null;
            patients[index] = { ...patients[index], ...updates };
            set('patients', patients);
            return patients[index];
        },

        getDoctors() {
            return get('doctors');
        },

        getDoctor(dni) {
            return this.getDoctors().find(d => d.dni === dni) || null;
        },

        saveDoctor(data) {
            const doctors = this.getDoctors();
            if (doctors.some(d => d.dni === data.dni)) return false;
            data.type = 'doctor';
            data.createdAt = new Date().toISOString();
            doctors.push(data);
            set('doctors', doctors);
            return true;
        },

        updateDoctor(dni, updates) {
            const doctors = this.getDoctors();
            const index = doctors.findIndex(d => d.dni === dni);
            if (index === -1) return null;
            doctors[index] = { ...doctors[index], ...updates };
            set('doctors', doctors);
            return doctors[index];
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
        getAppointments(filters = {}) {
            let list = get('appointments');
            if (filters.patientDni) list = list.filter(a => a.patientDni === filters.patientDni);
            if (filters.doctorDni) list = list.filter(a => a.doctorDni === filters.doctorDni);
            if (filters.date) list = list.filter(a => a.date === filters.date);
            if (filters.status) list = list.filter(a => a.status === filters.status);
            return list;
        },

        saveAppointment(data) {
            const list = get('appointments');
            data.id = this.generateId('apt');
            data.status = data.status || 'pendiente';
            data.createdAt = new Date().toISOString();
            list.push(data);
            set('appointments', list);
            return data;
        },

        updateAppointment(id, updates) {
            const list = get('appointments');
            const index = list.findIndex(a => a.id === id);
            if (index === -1) return null;
            list[index] = { ...list[index], ...updates };
            set('appointments', list);
            return list[index];
        },

        // ---- Requests ----
        getRequests(filters = {}) {
            let list = get('requests');
            if (filters.patientDni) list = list.filter(r => r.patientDni === filters.patientDni);
            if (filters.doctorDni) list = list.filter(r => r.doctorDni === filters.doctorDni);
            if (filters.status) list = list.filter(r => r.status === filters.status);
            if (filters.type) list = list.filter(r => r.type === filters.type);
            return list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        saveRequest(data) {
            const list = get('requests');
            data.id = this.generateId('req');
            data.status = data.status || 'pendiente';
            data.createdAt = new Date().toISOString();
            list.push(data);
            set('requests', list);
            return data;
        },

        updateRequest(id, updates) {
            const list = get('requests');
            const index = list.findIndex(r => r.id === id);
            if (index === -1) return null;
            list[index] = { ...list[index], ...updates };
            set('requests', list);
            return list[index];
        },

        // ---- Medical Records ----
        getRecords(patientDni) {
            const list = get('records');
            return list.filter(r => r.patientDni === patientDni).sort((a,b) => new Date(b.date) - new Date(a.date));
        },

        saveRecord(data) {
            const list = get('records');
            data.id = this.generateId('rec');
            data.createdAt = new Date().toISOString();
            list.push(data);
            set('records', list);
            return data;
        },

        // ---- Health Data ----
        getHealthData(patientDni, days = 30) {
            const list = get('health');
            const filtered = list.filter(h => h.patientDni === patientDni);
            return filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, days);
        },

        saveHealthData(data) {
            const list = get('health');
            data.id = this.generateId('hd');
            data.createdAt = new Date().toISOString();
            list.push(data);
            set('health', list);
            return data;
        },

        // ---- Notifications ----
        getNotifications(userDni, userType) {
            const list = get('notifications');
            return list.filter(n => n.userDni === userDni && n.userType === userType).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        saveNotification(data) {
            const list = get('notifications');
            data.id = this.generateId('not');
            data.read = false;
            data.createdAt = new Date().toISOString();
            list.push(data);
            set('notifications', list);
            return data;
        },

        markNotificationAsRead(id) {
            const list = get('notifications');
            const index = list.findIndex(n => n.id === id);
            if (index !== -1) {
                list[index].read = true;
                set('notifications', list);
            }
        },

        getUnreadCount(userDni, userType) {
            return get('notifications').filter(n => n.userDni === userDni && n.userType === userType && !n.read).length;
        },

        markAllAsRead(userDni, userType) {
            const list = get('notifications');
            list.forEach(n => {
                if (n.userDni === userDni && n.userType === userType) n.read = true;
            });
            set('notifications', list);
        },

        generateId(prefix) {
            return prefix + '_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
        },

        seedDemoData() {
            // Check if seeded
            if (this.getPatients().length > 0 || this.getDoctors().length > 0) return;

            // Seed Doctor
            const doc = {
                dni: '99999999',
                name: 'Dra. María González',
                matricula: 'MN45678',
                specialty: 'Clínica Médica',
                phone: '1155551234',
                consultationDuration: '30',
                schedule: {
                    lunes: { active: true, start: '08:00', end: '16:00' },
                    martes: { active: true, start: '08:00', end: '16:00' },
                    miercoles: { active: true, start: '08:00', end: '16:00' },
                    jueves: { active: true, start: '08:00', end: '16:00' },
                    viernes: { active: true, start: '08:00', end: '16:00' },
                    sabado: { active: false, start: '09:00', end: '12:00' },
                    domingo: { active: false, start: '09:00', end: '12:00' }
                }
            };
            this.saveDoctor(doc);

            // Seed Patient
            const pat = {
                dni: '11111111',
                name: 'Juan Carlos Pérez',
                phone: '1144445678',
                birthDate: '1948-05-12',
                obraSocial: 'OSDE',
                nroAfiliado: '1234567890'
            };
            this.savePatient(pat);

            // Seed some notifications
            this.saveNotification({
                userDni: '11111111',
                userType: 'patient',
                type: 'info',
                title: '¡Bienvenido/a a HolaDoc!',
                message: 'Tu perfil fue creado correctamente. Ya podés solicitar turnos y recetas.',
                relatedId: ''
            });

            // Seed health data
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                this.saveHealthData({
                    patientDni: '11111111',
                    date: d.toISOString().split('T')[0],
                    bloodPressureSys: 120 + Math.floor(Math.random() * 15),
                    bloodPressureDia: 75 + Math.floor(Math.random() * 10),
                    weight: 78.5 + (Math.random() * 1.5 - 0.75),
                    glucose: 90 + Math.floor(Math.random() * 25),
                    temperature: 36.2 + (Math.random() * 0.8),
                    heartRate: 68 + Math.floor(Math.random() * 12),
                    notes: i === 0 ? 'Me sentí bien hoy.' : ''
                });
            }

            // Seed medical record
            this.saveRecord({
                patientDni: '11111111',
                doctorDni: '99999999',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                reason: 'Control anual y ajuste de medicación para la presión.',
                pathologicalHistory: 'Hipertensión arterial diagnosticada en 2015. Artrosis leve.',
                surgicalHistory: 'Apendicectomía a los 15 años.',
                currentMedication: 'Enalapril 10mg diario por la mañana.',
                nextObjectives: 'Mantener presión bajo 135/85. Caminar 30 minutos diarios.',
                notes: 'Paciente se encuentra estable. Se sugiere continuar con dieta hiposódica.'
            });

            // Seed request
            this.saveRequest({
                patientDni: '11111111',
                doctorDni: '99999999',
                type: 'receta',
                status: 'pendiente',
                details: { medications: 'Enalapril 10mg - 1 caja de 30 comprimidos' },
                createdAt: new Date().toISOString()
            });
        }
    };
})();
