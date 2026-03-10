// ============================================
// Church Admin - Storage Adapter
// ============================================

class LocalStorageAdapter {
    getItem(key) {
        return localStorage.getItem(key);
    }

    setItem(key, value) {
        localStorage.setItem(key, value);
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
}

// Placeholder for future cloud database integration (Supabase/Firebase/etc.).
// Keep same synchronous interface for now so app behavior does not change.
class DatabaseAdapter {
    constructor(config = {}) {
        this.config = config;
    }

    getItem(_key) {
        // Temporary safe fallback in dev stage: still read from localStorage
        // while keeping adapter contract ready for cloud implementation.
        return localStorage.getItem(_key);
    }

    setItem(_key, _value) {
        localStorage.setItem(_key, _value);
    }

    removeItem(_key) {
        localStorage.removeItem(_key);
    }
}

const StorageService = {
    adapter: null,
    modeKey: 'storageMode',
    configKey: 'databaseConfig',
    autoSyncKey: 'storageAutoSync',
    autoPullKey: 'storageAutoPull',
    syncMetaKey: 'storageSyncMeta',
    defaultMode: 'local',
    syncTimer: null,
    syncInProgress: false,
    availableModes: {
        local: LocalStorageAdapter,
        database: DatabaseAdapter
    },

    getMode() {
        const mode = localStorage.getItem(this.modeKey) || this.defaultMode;
        return this.availableModes[mode] ? mode : this.defaultMode;
    },

    setMode(mode) {
        if (!this.availableModes[mode]) return false;
        localStorage.setItem(this.modeKey, mode);
        this.adapter = null;
        return true;
    },

    getDatabaseConfig() {
        const raw = localStorage.getItem(this.configKey);
        if (!raw) {
            return {
                provider: 'supabase',
                url: '',
                anonKey: '',
                table: 'app_storage'
            };
        }
        try {
            return {
                provider: 'supabase',
                table: 'app_storage',
                ...JSON.parse(raw)
            };
        } catch (error) {
            return {
                provider: 'supabase',
                url: '',
                anonKey: '',
                table: 'app_storage'
            };
        }
    },

    setDatabaseConfig(config) {
        const current = this.getDatabaseConfig();
        const next = {
            ...current,
            ...config
        };
        localStorage.setItem(this.configKey, JSON.stringify(next));
        this.adapter = null;
        return next;
    },

    isAutoSyncEnabled() {
        return localStorage.getItem(this.autoSyncKey) === 'true';
    },

    setAutoSyncEnabled(enabled) {
        localStorage.setItem(this.autoSyncKey, enabled ? 'true' : 'false');
    },

    isAutoPullEnabled() {
        return localStorage.getItem(this.autoPullKey) === 'true';
    },

    setAutoPullEnabled(enabled) {
        localStorage.setItem(this.autoPullKey, enabled ? 'true' : 'false');
    },

    getSyncMeta() {
        const raw = localStorage.getItem(this.syncMetaKey);
        const base = {
            dirty: false,
            lastLocalChangeAt: '',
            lastPushAt: '',
            lastPullAt: '',
            lastError: ''
        };
        if (!raw) return base;
        try {
            return { ...base, ...JSON.parse(raw) };
        } catch (error) {
            return base;
        }
    },

    setSyncMeta(nextMeta) {
        const merged = {
            ...this.getSyncMeta(),
            ...nextMeta
        };
        localStorage.setItem(this.syncMetaKey, JSON.stringify(merged));
        return merged;
    },

    markLocalChange() {
        this.setSyncMeta({
            dirty: true,
            lastLocalChangeAt: new Date().toISOString()
        });
    },

    markPushSuccess() {
        this.setSyncMeta({
            dirty: false,
            lastPushAt: new Date().toISOString(),
            lastError: ''
        });
    },

    markPullSuccess() {
        this.setSyncMeta({
            dirty: false,
            lastPullAt: new Date().toISOString(),
            lastError: ''
        });
    },

    markSyncError(message) {
        this.setSyncMeta({
            lastError: message || 'Unknown sync error'
        });
    },

    createAdapter() {
        const mode = this.getMode();
        const AdapterClass = this.availableModes[mode] || LocalStorageAdapter;
        try {
            if (mode === 'database') {
                return new AdapterClass(this.getDatabaseConfig());
            }
            return new AdapterClass();
        } catch (error) {
            // Safety fallback: never block app startup in dev.
            return new LocalStorageAdapter();
        }
    },

    init() {
        if (!this.adapter) {
            this.adapter = this.createAdapter();
        }
    },

    getSupabaseHeaders() {
        const config = this.getDatabaseConfig();
        const anonKey = config.anonKey || '';
        return {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
        };
    },

    getSupabaseBaseUrl() {
        const config = this.getDatabaseConfig();
        const baseUrl = (config.url || '').replace(/\/$/, '');
        const table = config.table || 'app_storage';
        return `${baseUrl}/rest/v1/${table}`;
    },

    isDatabaseConfigReady() {
        const config = this.getDatabaseConfig();
        return Boolean(config.url && config.anonKey && config.table);
    },

    async testDatabaseConnection() {
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        const url = `${this.getSupabaseBaseUrl()}?select=id&limit=1`;
        const res = await fetch(url, {
            method: 'GET',
            headers: this.getSupabaseHeaders()
        });
        if (!res.ok) {
            const message = await res.text();
            throw new Error(message || 'Gagal koneksi ke Supabase.');
        }
        return true;
    },

    async pushLocalDataToDatabase(storageKey = 'churchAdminData') {
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        const localData = this.getJSON(storageKey, null);
        if (!localData) {
            throw new Error('Data lokal tidak ditemukan.');
        }

        const payload = [{
            id: storageKey,
            payload: localData,
            updated_at: new Date().toISOString()
        }];

        const url = `${this.getSupabaseBaseUrl()}?on_conflict=id`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                ...this.getSupabaseHeaders(),
                Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const message = await res.text();
            this.markSyncError(message || 'Push data ke database gagal.');
            throw new Error(message || 'Push data ke database gagal.');
        }
        this.markPushSuccess();
        return true;
    },

    async pullDatabaseDataToLocal(storageKey = 'churchAdminData', options = {}) {
        const force = options.force === true;
        if (!this.isDatabaseConfigReady()) {
            throw new Error('Konfigurasi database belum lengkap.');
        }
        if (!force && this.getSyncMeta().dirty) {
            throw new Error('Ada perubahan lokal yang belum tersinkron. Push dulu atau gunakan force pull.');
        }
        const url = `${this.getSupabaseBaseUrl()}?id=eq.${encodeURIComponent(storageKey)}&select=payload,updated_at&limit=1`;
        const res = await fetch(url, {
            method: 'GET',
            headers: this.getSupabaseHeaders()
        });

        if (!res.ok) {
            const message = await res.text();
            this.markSyncError(message || 'Pull data dari database gagal.');
            throw new Error(message || 'Pull data dari database gagal.');
        }

        const rows = await res.json();
        if (!Array.isArray(rows) || !rows[0] || !rows[0].payload) {
            throw new Error('Data tidak ditemukan di database.');
        }

        this.setJSON(storageKey, rows[0].payload);
        this.markPullSuccess();
        return rows[0];
    },

    queueAutoPush(storageKey = 'churchAdminData', delayMs = 1200) {
        if (this.getMode() !== 'database' || !this.isAutoSyncEnabled() || !this.isDatabaseConfigReady()) {
            return;
        }
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(() => {
            this.syncTimer = null;
            this.performAutoPush(storageKey);
        }, delayMs);
    },

    async performAutoPush(storageKey = 'churchAdminData') {
        if (this.syncInProgress) return;
        this.syncInProgress = true;
        try {
            await this.pushLocalDataToDatabase(storageKey);
        } catch (error) {
            this.markSyncError(error.message);
            console.warn('[StorageService] Auto push failed:', error.message);
        } finally {
            this.syncInProgress = false;
        }
    },

    async autoPullOnStartup(storageKey = 'churchAdminData') {
        if (this.getMode() !== 'database' || !this.isAutoPullEnabled() || !this.isDatabaseConfigReady()) {
            return { pulled: false, reason: 'disabled' };
        }
        if (this.getSyncMeta().dirty) {
            return { pulled: false, reason: 'local_dirty' };
        }
        try {
            await this.pullDatabaseDataToLocal(storageKey, { force: false });
            return { pulled: true, reason: 'ok' };
        } catch (error) {
            this.markSyncError(error.message);
            console.warn('[StorageService] Auto pull skipped:', error.message);
            return { pulled: false, reason: 'error', message: error.message };
        }
    },

    setAdapter(adapter) {
        this.adapter = adapter;
    },

    has(key) {
        this.init();
        return this.adapter.getItem(key) !== null;
    },

    getJSON(key, fallback = null) {
        this.init();
        const raw = this.adapter.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    },

    setJSON(key, value) {
        this.init();
        this.adapter.setItem(key, JSON.stringify(value));
    },

    remove(key) {
        this.init();
        this.adapter.removeItem(key);
    }
};
