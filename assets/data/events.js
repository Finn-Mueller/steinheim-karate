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
        start: "2026-10-10",
        typ: "Turnier",
        titel: "14. Kempoka Ryu Cup",
        von: "10:00", bis: "16:00",
        ort: "Gymnasium Sporthalle Steinheim",
        adresse: "Ostpreussenstr. 15, 32839 Steinheim",
        text: "Offene Kempo-Meisterschaft, für alle Stilrichtungen und Verbände offen. Anmeldung über das Kontaktformular. Zuschauer sind herzlich willkommen."
    },
    {
        start: "2026-11-28",
        typ: "Event",
        titel: "Weihnachtsfeier",
        von: "10:00", bis: "16:00",
        text: "Interne Feier zum Jahresabschluss. Alle Mitglieder sind eingeladen. Bitte vorher anmelden."
    },
    {
        start: "2026-10-12", ende: "2026-10-25",
        typ: "Trainingsfrei",
        titel: "Herbstferien",
        ausfall: true
    },
    {
        start: "2026-12-23", ende: "2027-01-06",
        typ: "Trainingsfrei",
        titel: "Weihnachtspause",
        ausfall: true
    }
];