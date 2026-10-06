# Kempoka Ryu Steinheim

## Bilder lokal und in Cloudflare R2

Alle Website-Bilder verwenden Objekt-Keys relativ zu `assets/images/`. Die
Ordnerstruktur vor Ort entspricht damit direkt der Struktur im R2-Bucket:

```text
assets/images/
├── logo.webp
├── trainer-innen/
│   └── <name>.webp
└── gallery/
    └── <kategorie>/<JJJJ-MM-TT-album>/
        ├── cover.webp
        └── 01.webp
```

Trainerbilder werden in `assets/data/trainers.js` mit ihrem Objekt-Key
eingetragen. Galerie-Alben stehen in `assets/data/gallery.js`: `folder` ist der
Ordner-Key (zum Beispiel `gallery/turniere/2026-03-01-turnier/`), `cover` und
`photos` enthalten Dateinamen relativ zu diesem Ordner. Die Bildpfade werden
zentral in `assets/js/image-storage.js` aufgelöst.

Für die Umstellung:

1. Bilder mit genau diesen Keys in einen R2-Bucket hochladen. Die Bilder können
   beispielsweise über das Cloudflare-Dashboard hochgeladen werden.
2. Den Bucket über eine öffentliche Cloudflare-R2-Custom-Domain bereitstellen.
   In `assets/js/image-storage.js` `r2PublicBaseUrl` auf die HTTPS-Basis-URL
   setzen, zum Beispiel `https://bilder.example.de`.
3. Website neu bereitstellen. Die Seiten für Trainerbilder und Galerie laden
   dann dieselben Keys von R2. Ist die Basis-URL leer, werden Bilder weiterhin
   lokal aus `assets/images/` geladen.

Die Website enthält absichtlich keine R2-Zugangsdaten und lädt keine Bilder in
den Bucket hoch. Der Browser benötigt nur eine öffentliche Lese-URL. Für einen
privaten Bucket wären ein Worker oder ein Backend zum Erzeugen signierter URLs
notwendig; geheime Zugangsschlüssel dürfen nicht in diese statische Website.

## Noch offen

- „In Kalender speichern“ reparieren
