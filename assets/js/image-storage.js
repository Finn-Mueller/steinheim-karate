(function () {
    const r2PublicBaseUrl = 'https://media.karate-steinheim.com';
    const normalizedR2BaseUrl = r2PublicBaseUrl.trim().replace(/\/+$/, '');

    if (normalizedR2BaseUrl && !/^https:\/\//i.test(normalizedR2BaseUrl)) {
        throw new Error('Die öffentliche R2-Basis-URL muss mit https:// beginnen.');
    }

    window.imageStorage = Object.freeze({
        url(key, options) {
            if (typeof key !== 'string') {
                throw new TypeError('Ein Bildpfad muss als Zeichenkette angegeben werden.');
            }

            const isAbsoluteUrl = /^https?:\/\//i.test(key);
            if (isAbsoluteUrl) {
                if (!options) return key;
                throw new Error('Cloudflare-Transformationen benötigen einen Bildpfad im R2-Bucket.');
            }

            const normalizedKey = key.replace(/^\/+/, '');
            const segments = normalizedKey.split('/');
            if (!normalizedKey || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
                throw new Error(`Ungültiger Bildpfad: ${key}`);
            }

            const encodedKey = segments.map(encodeURIComponent).join('/');
            const sourceUrl = `${normalizedR2BaseUrl}/${encodedKey}`;
            if (!options) return sourceUrl;

            const { width, quality = 80 } = options;
            if (!Number.isInteger(width) || width < 1 || !Number.isInteger(quality) || quality < 1 || quality > 100) {
                throw new Error('Ungültige Bildtransformations-Optionen.');
            }

            return `${normalizedR2BaseUrl}/cdn-cgi/image/width=${width},quality=${quality},format=auto,fit=scale-down/${sourceUrl}`;
        }
    });
})();
