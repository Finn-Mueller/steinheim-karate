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

## Trainingsfreie Zeiten

Schulferien und gesetzliche Feiertage in Nordrhein-Westfalen werden aus der
OpenHolidays API bezogen. Der GitHub-Workflow unter
`.github/workflows/update-holiday-closures.yml` aktualisiert die Datei
`assets/data/holiday-closures.js` täglich und veröffentlicht Änderungen über
den normalen Website-Deploy. Der Workflow benötigt Schreibrechte auf den
Repository-Inhalt. Die Termin-Timeline zeigt nur Zeiträume mit mindestens
einem Trainingstag (Dienstag, Freitag oder Samstag) bis zum letzten
kommenden Termin; wenn keine Termine anstehen, zeigt sie den nächsten
relevanten Zeitraum.

Unregelmäßige, manuelle Trainingsausfälle werden weiterhin in
`assets/data/events.js` als Termine mit `ausfall: true` eingetragen. Ferien und
Feiertage bitte dort nicht zusätzlich pflegen.

Trainingstage und Trainingszeiten werden zentral in
`assets/data/training-schedule.js` gepflegt und sowohl auf der Trainingsplan-
als auch auf der Terminseite verwendet.
