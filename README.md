# Report Creator

## Konfiguration
Dieses Paket erwartet eine externe Feld-Konfiguration. Beim Einbinden von `ReportPage` muss ein
`config`-Objekt übergeben werden, das die Felddefinitionen pro Entity sowie die Zuordnung der
Report-Typen zu Entities enthält.

Beispiel (anhand der bisherigen Standardfelder):
```ts
import type { ReportConfig } from "./src";

const config: ReportConfig = {
  fieldsByEntity: {
    organisation: [
      { value: "name", label: "Name", dataType: "string" },
      ...
    ],
    organisation_statistics: [
      { value: "year", label: "Jahr", dataType: "number" },
      ...
    ],
    school: [
      { value: "name", label: "Name", dataType: "string" },
      ...
    ],
    offer: [
      { value: "name", label: "Name", dataType: "string" },
      ...
    ],
    output: [
      { value: "dateStart", label: "Beginn", dataType: "date" },
      ...
    ]
  },
  reportTypeEntities: {
    organisations: ["organisation"],
    organisations_statistics: ["organisation", "organisation_statistics"],
    schools_statistics_offers: ["school", "offer", "output"],
    organisations_offers: ["organisation", "offer"],
    organisations_offers_statistics: ["organisation", "offer", "output"],
    offer_statistics_comparison: ["offer", "output"]
  }
};

// Einbinden der Seite:
// <ReportPage {...pageData} config={config} callbacks={callbacks} />

// Beispiel: Datenquellen für PopupChangeData
// (übergeben als `dataSources` in ReportPageProps)
const dataSources = [
  {
    id: "collections",
    label: "Sammlungen",
    selection: "single",
    conditionKey: "collection_id",
    options: [
      { value: "collection-1", label: "Sammlung A" },
      { value: "collection-2", label: "Sammlung B" }
    ]
  },
  {
    id: "listings",
    label: "Einträge",
    selection: "multi",
    conditionKey: "listing_id",
    options: [
      { value: "listing-1", label: "Listing 1" },
      { value: "listing-2", label: "Listing 2" }
    ]
  }
];
```

`dataType` unterstützt: `number`, `string`, `boolean`, `date`, `array`, `float`.
