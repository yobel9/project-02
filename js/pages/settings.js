// ============================================
// Church Admin - Settings Page (Simplified)
// ============================================

const Settings = {
    async render() {
        const isAdmin = await Auth.isAdmin();
        const isDark = localStorage.getItem('theme') === 'dark';

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Pengaturan</h1>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tampilan</h3>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">
                    Pengaturan tampilan aplikasi.
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--background); border-radius: var(--radius);">
                    <div>
                        <strong>Mode Gelap (Dark Mode)</strong>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-secondary);">
                            Aktifkan tema gelap untuk kenyamanan mata.
                        </p>
                    </div>
                    <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
                        <input type="checkbox" id="darkModeToggle" ${isDark ? 'checked' : ''} onchange="Settings.toggleDarkMode()" style="opacity: 0; width: 0; height: 0;">
                        <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-dark); transition: 0.3s; border-radius: 28px;">
                            <span style="position: absolute; content: ''; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%; ${isDark ? 'transform: translateX(24px);' : ''}"></span>
                        </span>
                    </label>
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Backup & Restore Data</h3>
                </div>
                ${isAdmin ? `
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        Gunakan backup untuk menyimpan seluruh data aplikasi ke file JSON, dan restore untuk memulihkan data dari file backup.
                    </p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="App.exportBackup()">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V3M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            Backup Data
                        </button>
                        <button class="btn btn-primary" onclick="App.triggerRestore()">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            Restore Data
                        </button>
                    </div>
                ` : `
                    <p style="color: var(--text-secondary); margin: 0;">
                        Fitur backup/restore hanya tersedia untuk akun admin.
                    </p>
                `}
            </div>

            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Tentang Aplikasi</h3>
                </div>
                <div style="color: var(--text-secondary);">
                    <p><strong>GerejaKu Admin</strong> - Aplikasi Administrasi Gereja</p>
                    <p>Versi: 1.0.0</p>
                    <p style="margin-top: 10px;">Data disimpan secara lokal di browser (localStorage). Gunakan fitur backup untuk menjaga keamanan data Anda.</p>
                </div>
            </div>
        `;
        
        // Apply current theme
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },
    
    toggleDarkMode() {
        const checkbox = document.getElementById('darkModeToggle');
        const isDark = checkbox.checked;
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }
};
