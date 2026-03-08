// ============================================
// Church Admin - Organization Structure Page
// ============================================

const Attendance = {
    coreLeaders: [
        { role: 'Pendeta Utama', name: 'Pdt. Andreas Simanjuntak', phone: '0812-1111-2222', email: 'andreas@gerejaku.id' },
        { role: 'Pendeta Pembantu', name: 'Pdt. Maria Lestari', phone: '0812-3333-4444', email: 'maria@gerejaku.id' },
        { role: 'Penatua Utama', name: 'Bpk. Yohanes Lim', phone: '0812-5555-6666', email: 'yohanes@gerejaku.id' }
    ],

    teams: [
        { name: 'Ibadah Umum', lead: 'Pdt. Andreas Simanjuntak', members: 18, contact: '0812-1111-2222', schedule: 'Minggu 07:00' },
        { name: 'Sekolah Minggu', lead: 'Ibu Deborah', members: 14, contact: '0812-7777-8888', schedule: 'Minggu 09:00' },
        { name: 'Pemuda Remaja', lead: 'Bpk. Daniel', members: 12, contact: '0813-1234-5678', schedule: 'Sabtu 18:00' },
        { name: 'Pujian & Penyembahan', lead: 'Sdri. Grace', members: 10, contact: '0812-9999-0000', schedule: 'Kamis 19:00' },
        { name: 'Multimedia', lead: 'Sdr. Ardi', members: 8, contact: '0812-4444-1212', schedule: 'Minggu 06:00' },
        { name: 'Diakonia & Sosial', lead: 'Ibu Ruth', members: 9, contact: '0812-8888-3434', schedule: 'Fleksibel' }
    ],

    render() {
        const totalTeams = this.teams.length;
        const totalServants = this.teams.reduce((sum, t) => sum + t.members, 0);

        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Struktur Pengurus Gereja</h1>
                <button class="btn btn-primary" onclick="Attendance.showTeamListPrint()">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2"/><path d="M6 18H5A2 2 0 0 1 3 16V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V16A2 2 0 0 1 19 18H18" stroke="currentColor" stroke-width="2"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/></svg>
                    Cetak Struktur
                </button>
            </div>

            <div class="summary-grid" style="margin-bottom: 20px;">
                <div class="summary-card">
                    <div class="summary-label">Total Komisi</div>
                    <div class="summary-value">${totalTeams}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Pelayan</div>
                    <div class="summary-value">${totalServants}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Jumlah Pendeta</div>
                    <div class="summary-value">${this.coreLeaders.filter(l => l.role.includes('Pendeta')).length}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Penatua</div>
                    <div class="summary-value">${this.coreLeaders.filter(l => l.role.includes('Penatua')).length}</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Kepemimpinan Inti</h3>
                </div>
                <div class="summary-grid" style="margin-bottom: 0; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                    ${this.coreLeaders.map(leader => `
                        <div class="summary-card" style="align-items: flex-start;">
                            <div class="summary-label">${leader.role}</div>
                            <div class="summary-value" style="font-size: 1.1rem;">${leader.name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 6px;">
                                <div>📞 ${leader.phone}</div>
                                <div>✉️ ${leader.email}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Daftar Komisi & Pengurus</h3>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Komisi</th>
                                <th>Ketua</th>
                                <th>Jumlah Pelayan</th>
                                <th>Kontak</th>
                                <th>Jadwal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.teams.map(team => `
                                <tr>
                                    <td>${team.name}</td>
                                    <td>${team.lead}</td>
                                    <td>${team.members} orang</td>
                                    <td>${team.contact}</td>
                                    <td>${team.schedule}</td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="action-btn view" onclick="Attendance.showTeamDetail('${team.name}')" title="Detail">
                                                <svg viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    showTeamDetail(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team) return;

        const bodyHtml = `
            <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Komisi</span>
                    <span>${team.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Ketua</span>
                    <span>${team.lead}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Jumlah Pelayan</span>
                    <span>${team.members} orang</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Kontak</span>
                    <span>${team.contact}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: var(--background); border-radius: var(--radius);">
                    <span style="color: var(--text-secondary);">Jadwal</span>
                    <span>${team.schedule}</span>
                </div>
            </div>
        `;

        const footerHtml = `
            <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
        `;

        Components.modal('Detail Komisi', bodyHtml, footerHtml);
    },

    showTeamListPrint() {
        const rows = this.teams.map((team, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${team.name}</td>
                <td>${team.lead}</td>
                <td>${team.members} orang</td>
                <td>${team.contact}</td>
                <td>${team.schedule}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            Components.toast('Pop-up diblokir browser. Izinkan pop-up untuk mencetak.', 'warning');
            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Cetak Struktur Pengurus</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
                    h1 { font-size: 20px; margin-bottom: 6px; }
                    p { color: #6b7280; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #f3f4f6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Struktur Pengurus Gereja</h1>
                <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Komisi</th>
                            <th>Ketua</th>
                            <th>Jumlah Pelayan</th>
                            <th>Kontak</th>
                            <th>Jadwal</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};
