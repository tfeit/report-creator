"use client";

import ReportInner from "./components/ReportInner";
import { ReportProvider } from "./ReportContext";
import { ReportPageProps } from "./types";

export const ReportPage = (props: ReportPageProps) => {
  return (
    <ReportProvider {...props}>
      <ReportInner />
    </ReportProvider>
  );
};
