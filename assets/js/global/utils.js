const refreshIcons = () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};

const logger = {
    debug: (msg, data = '') => console.debug(`[F1 DEBUG] ${msg}`, data),
    info: (msg, data = '') => console.info(`[F1 INFO] ${msg}`, data),
    warn: (msg, data = '') => console.warn(`[F1 WARN] ${msg}`, data),
    error: (msg, data = '') => console.error(`[F1 ERROR] ${msg}`, data)
};