import { useMemo, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { groupData } from "../../../helpers/grouping";

export default function BarChart({
  data,
  displayFields,
  chartInstance
}: {
  data: any;
  displayFields: any;
  chartInstance: React.RefObject<echarts.ECharts | null>;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  const groupingFields = useMemo(() => {
    return displayFields.filter((field: any) => field.grouping).sort((a: any, b: any) => a.order - b.order);
  }, [displayFields]);

  const groupedData = useMemo(() => {
    return groupData(data, displayFields);
  }, [data, displayFields]);

  useEffect(() => {
    let chart: echarts.ECharts | null = null;

    const initChart = () => {
      if (!chartRef.current) return;

      if (groupingFields.length > 1) {
        const primaryGroups = Array.from(new Set(groupedData.filter(g => g.isPrimaryGroup).map(g => g.group)));
        const secondaryGroups = Array.from(new Set(groupedData.filter(g => !g.isPrimaryGroup).map(g => g.group)));
        const series = secondaryGroups.map(sec => ({
          name: sec,
          type: "bar",
          data: primaryGroups.map(prim => {
            const entry = groupedData.find(
              g => !g.isPrimaryGroup && g.group === sec && "parent" in g && g.parent === prim
            );
            return entry ? entry.groupAggregate || 0 : 0;
          }),
          itemStyle: { color: undefined }
        }));

        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" }
          },
          legend: { data: secondaryGroups },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category",
            data: primaryGroups.map(name => (name && name.length > 25 ? name.substring(0, 25) + "..." : name)),
            axisLabel: { interval: 0, rotate: 0 }
          },
          yAxis: { type: "value" },
          series
        };

        chart = echarts.init(chartRef.current);
        chart.setOption(option);
        chartInstance.current = chart;
      } else {
        const chartData = groupedData.map(item => ({
          name: item.group || "Ohne Gruppe",
          value: item.groupAggregate || 0
        }));
        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" }
          },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category",
            data: chartData.map(item => (item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name)),
            axisLabel: { interval: 0, rotate: 0 }
          },
          yAxis: { type: "value" },
          series: [
            {
              name: groupingFields[0]?.field || "Wert",
              type: "bar",
              data: chartData.map(item => item.value),
              itemStyle: { color: "#0E7490" }
            }
          ]
        };
        chart = echarts.init(chartRef.current);
        chart.setOption(option);
        chartInstance.current = chart;
      }
    };

    initChart();

    return () => {
      if (chart) {
        chart.dispose();
        chart = null;
        chartInstance.current = null;
      }
    };
  }, [groupedData, groupingFields, chartInstance, displayFields]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartInstance]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
}
