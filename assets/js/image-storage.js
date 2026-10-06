(function () {
    const r2PublicBaseUrl = '';
    const normalizedR2BaseUrl = r2PublicBaseUrl.trim().replace(/\/+$/, '');

    if (normalizedR2BaseUrl && !/^https:\/\//i.test(normalizedR2BaseUrl)) {
        throw new Error('Die öffentliche R2-Basis-URL muss mit https:// beginnen.');
    }

    window.imageStorage = Object.freeze({
        url(key) {
            if (typeof key !== 'string') {
                throw new TypeError('Ein Bildpfad muss als Zeichenkette angegeben werden.');
            }

            if (/^https?:\/\//i.test(key)) return key;

            const normalizedKey = key.replace(/^\/+/, '');
            const segments = normalizedKey.split('/');
            if (!normalizedKey || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
                throw new Error(`Ungültiger Bildpfad: ${key}`);
            }

            const encodedKey = segments.map(encodeURIComponent).join('/');
            const baseUrl = normalizedR2BaseUrl || 'assets/images';
            return `${baseUrl}/${encodedKey}`;
        }
    });
})();
