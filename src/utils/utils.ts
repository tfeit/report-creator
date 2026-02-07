import { Field, Report, ReportConfig } from "../types";

export const transformOrganisationData = (data: any) => {
  if (!data) return data;

  return {
    organisation_name: data.name,
    organisation_rechtsform: data.rechtsform,
    organisation_foundingYear: data.foundingYear,
    organisation_regionen: data.regionen,
    organisation_sdgs: data.sdgs,
    organisation_handlungsfelder: data.handlungsfelder,
    organisation_zielgruppen: data.zielgruppen,
    organisation_bildungsabschnitte: data.bildungsabschnitte,
    organisation_street: data.street,
    organisation_zip: data.zip,
    organisation_city: data.city,
    organisation_state: data.state,
    organisation_country: data.country,
    organisation_website: data.website,
    organisation_email: data.email,
    organisation_phone: data.phone,
    organisation_dateUpdated: data.dateUpdated
  };
};

export const transformStatisticsData = (data: any) => {
  if (!data?.statistics) return data;

  const organisationData = {
    organisation_name: data.name,
    organisation_rechtsform: data.rechtsform,
    organisation_foundingYear: data.foundingYear,
    organisation_bundesland: data.bundesland,
    ...Object.fromEntries(Object.entries(data).filter(([key]) => key !== "statistics")),
    years: Object.entries(data.statistics).map(([year, stats]) => ({
      organisation_statistics_year: year,
      organisation_statistics_employees: (stats as any).employees || "0",
      organisation_statistics_freelancers: (stats as any).freelancers || "0",
      organisation_statistics_volunteerHours: (stats as any).volunteerHours || "0",
      organisation_statistics_volunteers: (stats as any).volunteers || "0",
      organisation_statistics_income: (stats as any).income || "0",
      organisation_statistics_fundingShare: (stats as any).fundingShare || "0",
      organisation_statistics_donationShare: (stats as any).donationShare || "0",
      organisation_statistics_businessShare: (stats as any).businessShare || "0",
      organisation_statistics_students: (stats as any).students || "0",
      organisation_statistics_teachers: (stats as any).teachers || "0",
      organisation_statistics_principals: (stats as any).principals || "0"
    }))
  };

  return [organisationData];
};

export const transformOrganisationOffersData = (data: any) => {
  if (!data?.offers) return data;

  return data.offers.flatMap((offer: any) => {
    const transformedData: Record<string, unknown> = {
      offer_name: offer.name,
      offer_primaryType: offer.primaryType,
      offer_secondaryType: offer.secondaryType,
      offer_level: offer.level,
      offer_levelDetails: offer.levelDetails,
      offer_terms: offer.terms,
      organisation_name: data.name,
      organisation_rechtsform: data.rechtsform,
      organisation_foundingYear: data.foundingYear,
      organisation_regionen: data.regionen,
      organisation_sdgs: data.sdgs,
      organisation_handlungsfelder: data.handlungsfelder,
      organisation_zielgruppen: data.zielgruppen,
      organisation_bildungsabschnitte: data.bildungsabschnitte,
      organisation_street: data.street,
      organisation_zip: data.zip,
      organisation_city: data.city,
      organisation_country: data.country,
      organisation_website: data.website,
      organisation_email: data.email,
      organisation_phone: data.phone
    };

    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    return transformedData;
  });
};

export const transformSchoolsStatisticsOffersData = (data: any) => {
  if (!data?.cooperations) return data;

  return data.cooperations.flatMap((cooperation: any) => {
    if (!cooperation?.statistics) return [];

    return cooperation.statistics.map((statistic: any) => {
      const transformedData: Record<string, unknown> = {
        offer_name: cooperation.offer,
        offer_primaryType: cooperation.primaryType,
        offer_secondaryType: cooperation.secondaryType,
        offer_level: cooperation.level,
        offer_levelDetails: cooperation.levelDetails,
        offer_terms: cooperation.terms,
        school_name: data.name,
        school_schoolType: data.schulform,
        ...Object.keys(statistic).reduce(
          (acc, key) => ({
            ...acc,
            [`output_${key}`]: statistic[key]
          }),
          {}
        )
      };

      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      return transformedData;
    });
  });
};

export const transformOrganisationStatisticsOffersData = (data: any) => {
  if (!data) return data;

  const organisations = Array.isArray(data) ? data : [data];

  return organisations.flatMap((organisation: any) => {
    if (!organisation?.offers) return [];

    return organisation.offers.flatMap((offer: any) => {
      if (!offer?.statistics) return [];

      return offer.statistics.map((statistic: any) => {
        const transformedData: Record<string, unknown> = {
          offer_name: offer.name,
          offer_primaryType: offer.primaryType,
          offer_offerID: offer.offerID,
          organisation_name: organisation.name,
          organisation_foundingYear: organisation.foundingYear,
          ...Object.keys(statistic).reduce(
            (acc, key) => ({
              ...acc,
              [`output_${key}`]: statistic[key]
            }),
            {}
          )
        };

        Object.keys(transformedData).forEach(key => {
          if (transformedData[key] === undefined) {
            delete transformedData[key];
          }
        });

        return transformedData;
      });
    });
  });
};

export const getTransformedReportContent = (
  reportContent: any[] | null | undefined,
  report: Report | null | undefined
) => {
  if (!reportContent || reportContent.length === 0) {
    return [];
  }

  let transformedData: any[] = reportContent;
  if (report?.type === "schools_statistics_offers") {
    transformedData = reportContent.flatMap(school => transformSchoolsStatisticsOffersData(school));
  }
  if (report?.type === "organisations") {
    transformedData = reportContent.flatMap(organisation => {
      const transformedOrganisation = transformOrganisationData(organisation);
      return transformedOrganisation;
    });
  }
  if (report?.type === "organisations_statistics") {
    transformedData = reportContent.flatMap(organisation => {
      const transformedOrganisation = transformStatisticsData(organisation);
      return transformedOrganisation.flatMap((org: any) =>
        org.years.map((year: any) => ({
          ...org,
          ...year
        }))
      );
    });
  }
  if (report?.type === "organisations_offers_statistics") {
    transformedData = reportContent.flatMap(organisation =>
      transformOrganisationStatisticsOffersData(organisation)
    );
  }
  if (report?.type === "organisations_offers") {
    transformedData = reportContent.flatMap(organisation =>
      transformOrganisationOffersData(organisation)
    );
  }

  return transformedData;
};

export const getFieldLabelFromConfig = (
  config: ReportConfig,
  entityType: string,
  fieldValue: string
) => {
  const fields = config.fieldsByEntity?.[entityType] ?? [];
  const field = fields.find(entry => entry.value === fieldValue);
  return field ? field.label : fieldValue;
};

export const handleExport = (
  reportContent: any[] | null | undefined,
  report: Report | null | undefined,
  displayFields: Field[],
  config: ReportConfig
) => {
  if (!reportContent || reportContent.length === 0) {
    console.error("Keine Daten zum Exportieren vorhanden");
    return;
  }

  let transformedData: any[] = getTransformedReportContent(reportContent, report);

  const sortedDisplayFields = [...displayFields]
    .filter(field => field.visible)
    .sort((a, b) => a.order - b.order);

  const headers = sortedDisplayFields.map(field => {
    return getFieldLabelFromConfig(config, field.type, field.field);
  });

  const csvContent = [
    headers.join(","),
    ...transformedData.map(row => {
      return sortedDisplayFields
        .map(field => {
          const key = `${field.type}_${field.field}`;
          const value = row[key];

          if (Array.isArray(value)) {
            return `"${value.join(", ")}"`;
          }
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",");
    })
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${report?.title || "report"}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
