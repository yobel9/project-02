// ============================================
// Church Admin - Simple Auth (LocalStorage Only)
// ============================================

const Auth = {
    sessionKey: 'churchAdminSession',
    usersKey: 'churchAdminUsers',

    // Cek apakah user sudah login
    isAuthenticated() {
        const session = localStorage.getItem(this.sessionKey);
        return session !== null;
    },

    // Login dengan username dan password
    login(username, password) {
        // Load users dari AppData jika sudah tersedia
        let users = [];
        
        if (typeof AppData !== 'undefined' && AppData.getUsers) {
            // Coba dari AppData (data.js)
            try {
                users = AppData.getUsers();
                if (!users || users.length === 0) {
                    // Jika AppData belum diinisialisasi dengan benar, buat default
                    users = [
                        {
                            id: '1',
                            name: 'Administrator',
                            username: 'admin',
                            password: 'admin123',
                            role: 'admin',
                            status: 'active'
                        }
                    ];
                    // Simpan ke churchAdminUsers untuk fallback
                    localStorage.setItem(this.usersKey, JSON.stringify(users));
                }
            } catch (e) {
                console.warn('AppData not ready, using fallback');
                users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
            }
        } else {
            // Fallback ke churchAdminUsers
            users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        }
        
        // Jika users kosong, buat default admin
        if (!users || users.length === 0) {
            users = [
                {
                    id: '1',
                    name: 'Administrator',
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    status: 'active'
                }
            ];
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            
            // Juga simpan ke AppData jika tersedia
            if (typeof AppData !== 'undefined' && AppData.addUser) {
                try {
                    AppData.addUser(users[0]);
                } catch (e) {
                    console.warn('Could not add user to AppData');
                }
            }
        }

        // Cari user
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.status === 'active'
        );

        if (!user) {
            return false;
        }

        // Simpan session
        localStorage.setItem(this.sessionKey, JSON.stringify({
            userId: user.id,
            loginAt: new Date().toISOString()
        }));

        return true;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.reload();
    },

    // Cek apakah user adalah admin
    isAdmin() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return false;
        
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Cek apakah user adalah admin (sync version untuk render functions)
    isAdminSync() {
        return this.isAdmin();
    },

    // Get current user synchronously
    getCurrentUserSync() {
        return this.getCurrentUser();
    },

    // Cek apakah user bisa menghapus data
    canDelete() {
        return this.isAdmin();
    },

    // Cek apakah user bisa menghapus data (sync version)
    canDeleteSync() {
        return this.isAdminSync();
    },

    // Dapatkan user saat ini
    getCurrentUser() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return null;

        // Coba dari AppData (data.js) jika sudah diinisialisasi
        if (typeof AppData !== 'undefined' && AppData.getData && AppData.getUsers) {
            try {
                const data = AppData.getData();
                if (data && data.users && Array.isArray(data.users)) {
                    const users = data.users;
                    const userId = JSON.parse(session).userId;
                    const user = users.find(u => u.id === userId);
                    if (user) return user;
                }
            } catch (e) {
                console.warn('Error reading from AppData:', e);
            }
        }

        // Fallback ke churchAdminUsers (untuk kompatibilitas)
        const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        const userId = JSON.parse(session).userId;
        
        return users.find(u => u.id === userId) || null;
    },

    // Render halaman login dan return true/false
    async requireAuth() {
        if (this.isAuthenticated()) {
            document.body.classList.remove('auth-screen');
            return true;
        }
        this.renderLogin();
        return false;
    },

    // Render halaman login
    renderLogin(errorMessage = '') {
        document.body.classList.add('auth-screen');
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="auth-card">
                <div style="text-align:center; margin-bottom: 20px;">
                    <h2 style="margin-bottom:6px;">Login Admin Gereja</h2>
                    <p style="margin:0; color: var(--text-secondary);">Silakan masuk untuk melanjutkan</p>
                </div>
                ${errorMessage ? `<div style="background: rgba(229,62,62,0.1); color: var(--danger); border:1px solid rgba(229,62,62,0.2); border-radius: 8px; padding: 10px; margin-bottom: 12px;">${errorMessage}</div>` : ''}
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label required">Username</label>
                        <input type="text" class="form-input" name="username" required autofocus>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Password</label>
                        <input type="password" class="form-input" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Masuk</button>
                </form>
                <p style="margin-top: 12px; color: var(--text-muted); font-size: 0.85rem; text-align:center;">
                    Default: <strong>admin</strong> / <strong>admin123</strong>
                </p>
            </div>
        `;

        // Setup form submit
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = Object.fromEntries(new FormData(form).entries());
                const ok = this.login(formData.username?.trim(), formData.password || '');
                if (!ok) {
                    this.renderLogin('Username atau password salah.');
                    return;
                }
                window.location.reload();
            });
        }
    }
};
