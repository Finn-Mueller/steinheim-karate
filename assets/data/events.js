/*
  Felder:
    start   (Pflicht)  "JJJJ-MM-TT"
    typ     (Pflicht)  z. B. "Turnier", "Prüfung", "Lehrgang", "Trainingsfrei"
    titel   (Pflicht)
    ende    (optional) letzter Tag bei mehrtägigen Terminen
    von/bis (optional) "HH:MM"; ohne Uhrzeit wird der Termin ganztägig eingetragen
    ort     (optional) Anzeigename, z. B. "Sporthalle Steinheim", wird zum Karten-Link
    adresse (optional) genauere Adresse für die Karte, z. B. "Musterstraße 1, 33184 Altenbeken"
    text    (optional)
    ausfall (optional) true = rot markiert, wird nie "Als Nächstes"
*/
const EVENTS = [
    {
        start: "2026-11-14",
        typ: "Turnier",
        titel: "Vereinsturnier",
        von: "10:00", bis: "16:00",
        ort: "Sporthalle Steinheim",
        adresse: "Musterstraße 1, 33184 Altenbeken",
        text: "Interner Wettkampf für alle Gürtelgrade. Zuschauer sind willkommen."
    },
    {
        start: "2026-12-05", ende: "2026-12-06",
        typ: "Lehrgang",
        titel: "Wochenend-Lehrgang",
        ort: "Sporthalle Steinheim",
        text: "Gasttrainer, Schwerpunkt Selbstverteidigung."
    },
    {
        start: "2026-12-18",
        typ: "Prüfung",
        titel: "Gürtelprüfung",
        von: "18:00"
    },
    {
        start: "2026-12-25", ende: "2027-01-03",
        typ: "Trainingsfrei",
        titel: "Weihnachtspause",
        ausfall: true
    }
];