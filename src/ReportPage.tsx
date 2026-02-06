"use client";

import ReportData from "./components/ReportData";
import { ReportProvider } from "./ReportContext";
import { ReportPageProps } from "./types";

export const ReportPage = (props: ReportPageProps) => {
  return (
    <ReportProvider {...props}>
      <ReportData />
    </ReportProvider>
  );
};
