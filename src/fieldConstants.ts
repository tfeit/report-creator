export const ORGANSIATIONFIELDS = [
  { value: "name", label: "Name", dataType: "string" },
  { value: "rechtsform", label: "Rechtsform", dataType: "string" },
  { value: "foundingYear", label: "Gründungsjahr", dataType: "number" },
  { value: "zip", label: "PLZ", dataType: "string" },
  { value: "city", label: "Stadt", dataType: "string" },
  { value: "street", label: "Straße", dataType: "string" },
  { value: "state", label: "Bundesland", dataType: "string" },
  { value: "email", label: "E-Mail", dataType: "string" },
  { value: "phone", label: "Telefon", dataType: "string" },
  { value: "website", label: "Website", dataType: "string" },
  { value: "tags", label: "Schlagwörter", dataType: "array" },
  { value: "sdgs", label: "Nachhaltigkeitsziele", dataType: "array" },
  { value: "handlungsfelder", label: "Handlungsfelder", dataType: "array" },
  { value: "bildungsabschnitte", label: "Bildungsabschnitte", dataType: "array" },
  { value: "targetgroups", label: "Zielgruppen", dataType: "array" },
  { value: "dateUpdated", label: "Aktualisiert am", dataType: "date" }
];

export const ORGANISATIONSTATISTICSFIELDS = [
  { value: "year", label: "Jahr", dataType: "number" },
  { value: "fte", label: "Vollzeitäquivalente", dataType: "float" },
  { value: "employees", label: "Angestellte", dataType: "number" },
  { value: "freelancers", label: "Freiberufliche", dataType: "number" },
  { value: "volunteers", label: "Ehrenamtliche", dataType: "number" },
  { value: "volunteerHours", label: "Ehrenamtliche Stunden", dataType: "number" },
  { value: "income", label: "Einkommen", dataType: "number" },
  { value: "fundingShare", label: "Fördergelder (%)", dataType: "float" },
  { value: "donationShare", label: "Spenden (%)", dataType: "float" },
  { value: "businessShare", label: "Wirtschaftlicher Zweckbetrieb (%)", dataType: "float" },
  { value: "students", label: "Erreichte Schüler:innen", dataType: "number" },
  { value: "teachers", label: "Erreichte Lehrer:innen", dataType: "number" },
  { value: "schools", label: "Erreichte Schulen", dataType: "number" },
  { value: "principals", label: "Erreichte Schulleitungen", dataType: "number" },
  { value: "impactReportLink", label: "Wirkungsbericht", dataType: "string" },
  { value: "financialReportLink", label: "Jahresabschluss", dataType: "string" }
];

export const SCHOOLFIELDS = [
  { value: "name", label: "Name", dataType: "string" },
  { value: "schoolType", label: "Schulform", dataType: "string" },
  { value: "zip", label: "PLZ", dataType: "string" },
  { value: "city", label: "Stadt", dataType: "string" },
  { value: "street", label: "Straße", dataType: "string" },
  { value: "state", label: "Bundesland", dataType: "string" },
  { value: "country", label: "Land", dataType: "string" },
  { value: "tags", label: "Schlagwörter", dataType: "array" }
];

export const OFFERFIELDS = [
  { value: "name", label: "Name", dataType: "string" },
  { value: "primaryType", label: "Art des Angebots", dataType: "string" },
  { value: "secondaryType", label: "Art des Angebots - Detail", dataType: "string" },
  { value: "level", label: "Ebene des Angebots", dataType: "string" },
  { value: "levelDetails", label: "Ebene des Angebots - Detail", dataType: "string" },
  { value: "targetgroups", label: "Zielgruppen", dataType: "array" },
  { value: "tags", label: "Schlagwörter", dataType: "array" },
  { value: "sdgs", label: "Nachhaltigkeitsziele", dataType: "array" },
  { value: "handlungsfelder", label: "Handlungsfelder", dataType: "array" },
  { value: "bildungsabschnitte", label: "Bildungsabschnitte", dataType: "array" },
  { value: "subjects", label: "Fächer", dataType: "array" }
];

export const OUTPUTFIELDS = [
  { value: "dateStart", label: "Beginn", dataType: "date" },
  { value: "dateEnd", label: "Ende", dataType: "date" },
  { value: "schoolYear", label: "Schuljahr", dataType: "string" },
  { value: "frequency", label: "Häufigkeit", dataType: "string" },
  { value: "reachStudents", label: "Anzahl Schüler:innen", dataType: "number" },
  { value: "reachTeachers", label: "Anzahl Lehrer:innen", dataType: "number" },
  { value: "educationalLevels", label: "Klassenstufen", dataType: "array" }
];

export const AGGREGATION_METHODS = [
  { value: "sum", label: "Summe" },
  { value: "average", label: "Durchschnitt" },
  { value: "count", label: "Anzahl" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" }
];
