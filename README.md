# Kempoka Ryu Steinheim

## Bilder in Cloudflare R2

Trainer- und Galerie-Bilder werden über die öffentliche R2-Domain
`https://media.karate-steinheim.com` geladen. Die Objekt-Keys entsprechen den
Ordnern im Bucket `steinheim-karate-media`:

```text
steinheim-karate-media/
├── coaches/
│   └── <name>.webp
└── gallery/
    └── <kategorie>/<JJJJ-MM-TT-album>/
        ├── cover.webp
        └── 01.webp
```

Trainerbilder werden in `assets/data/trainers.js` mit einem Key unter `coaches/`
eingetragen. Galerie-Alben stehen in `assets/data/gallery.js`: `folder` ist der
Ordner-Key (zum Beispiel `gallery/turniere/2026-03-01-turnier/`), `cover` und
`photos` enthalten Dateinamen relativ zu diesem Ordner. Die Bildpfade werden
zentral in `assets/js/image-storage.js` mit der R2-Domain zusammengesetzt.

Neue Trainerbilder gehören direkt in `coaches/`; Galerie-Bilder kommen in
`gallery/<kategorie>/<album>/`. Die Dateinamen in den Datendateien müssen den
Objekt-Keys im Bucket entsprechen. Die Galerie fordert verkleinerte Varianten
über Cloudflare Image Resizing an: Albumkarten verwenden 640 Pixel breite
Varianten, die Albumansicht 960 Pixel. Ein Klick auf ein Foto öffnet weiterhin
das Original. Image Resizing muss in Cloudflare für die Zone aktiv sein, über
die `media.karate-steinheim.com` ausgeliefert wird.

Die Website enthält absichtlich keine R2-Zugangsdaten und lädt keine Bilder in
den Bucket hoch. Der Browser benötigt nur die öffentliche Lese-URL. Für einen
privaten Bucket wären ein Worker oder ein Backend zum Erzeugen signierter URLs
notwendig; geheime Zugangsschlüssel dürfen nicht in diese statische Website.
