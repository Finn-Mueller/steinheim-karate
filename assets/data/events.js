/*
  Felder:
    start   (Pflicht)  "JJJJ-MM-TT"
    typ     (Pflicht)  z. B. "Turnier", "Prüfung", "Lehrgang"
    titel   (Pflicht)
    ende    (optional) letzter Tag bei mehrtägigen Terminen
    von/bis (optional) "HH:MM"; ohne Uhrzeit wird der Termin ganztägig eingetragen
    ort     (optional) Anzeigename, z. B. "Sporthalle Steinheim", wird zum Karten-Link
    adresse (optional) genauere Adresse für die Karte, z. B. "Musterstraße 1, 33184 Altenbeken"
    text    (optional)
    ausfall (optional) true = manueller Sonderausfall, wird nie "Als Nächstes"
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
];