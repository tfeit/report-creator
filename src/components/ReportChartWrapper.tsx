"use client";

import { lazy, Suspense, memo, useRef, useState } from "react";
import * as echarts from "echarts";
import Button from "./ui/Button";
import { ArrowDownTrayIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useReport } from "../hooks/useReport";
import DropdownContainer from "./ui/DropdownContainer";
import ChartType from "./ChartType";

const PieChart = lazy(() => import("./ui/Chart/PieChart"));
const BarChart = lazy(() => import("./ui/Chart/BarChart"));
const TreeMap = lazy(() => import("./ui/Chart/TreeMap"));

function ReportChartWrapper({ data }: { data: any }) {
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { chart, displayFields } = useReport();

  const handleDownload = () => {
    if (chartInstance.current) {
      const dataUrl = chartInstance.current.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff"
      });
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="relative flex flex-col py-4 border border-gray-200 rounded-lg mt-4 min-h-[400px]">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <DropdownContainer icon={Cog6ToothIcon} content={<ChartType />} lockBodyScroll={false} />
        
        <Button variant="outlined" color="transparent" size="square" 
        rounded="full" onClick={handleDownload} icon={ArrowDownTrayIcon} />

      </div>

      <Suspense fallback={<></>}>
        {chart === "bar" && <BarChart data={data} displayFields={displayFields} chartInstance={chartInstance} />}
        {chart === "pie" && <PieChart data={data} displayFields={displayFields} chartInstance={chartInstance} />}
        {chart === "treemap" && <TreeMap data={data} displayFields={displayFields} chartInstance={chartInstance} />}
      </Suspense>

    </div>
  );
}

export default memo(ReportChartWrapper);
