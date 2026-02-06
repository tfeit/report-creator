# Report Creator

## Konfiguration
Dieses Paket erwartet eine externe Feld-Konfiguration. Beim Einbinden von `ReportPage` muss ein
`config`-Objekt übergeben werden, das die Felddefinitionen pro Entity sowie die Zuordnung der
Report-Typen zu Entities enthält.

Beispiel (gekürzt, mit Platzhalter-Namen):
```ts
import type { ReportConfig } from "./src";

const config: ReportConfig = {
  fieldsByEntity: {
    entity: [
      { value: "field", label: "Feld", dataType: "string" }
    ]
  },
  reportTypeEntities: {
    reportType: ["entity"]
  }
};

// Einbinden der Seite:
// <ReportPage {...pageData} config={config} callbacks={callbacks} />
```

`dataType` unterstützt: `number`, `string`, `boolean`, `date`, `array`, `float`.
