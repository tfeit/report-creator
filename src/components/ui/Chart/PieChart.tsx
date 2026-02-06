import { useMemo, useEffect, useRef } from "react";
import * as echarts from "echarts";

type Grouped = {
  group: string;
  items: any[];
  groupAggregate: number | null;
  isPrimaryGroup: boolean;
  parent?: string;
};

export default function PieChart({
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
    if (!groupingFields.length) return [{ group: null, items: data, groupAggregate: null, isPrimaryGroup: true }];

    const primaryField = groupingFields[0];
    const secondaryField = groupingFields[1];

    const groups: { [key: string]: { [key: string]: any[] } } = {};
    data.forEach((item: any) => {
      const primaryFieldName = `${primaryField.type}_${primaryField.field}`;
      const secondaryFieldName = secondaryField ? `${secondaryField.type}_${secondaryField.field}` : null;

      const primary = item[primaryFieldName] ?? "Ohne Gruppe";
      const secondary = secondaryFieldName ? (item[secondaryFieldName] ?? "Ohne Untergruppe") : null;

      if (!groups[primary]) groups[primary] = {};
      if (secondary) {
        if (!groups[primary][secondary]) groups[primary][secondary] = [];
        groups[primary][secondary].push(item);
      } else {
        if (!groups[primary]["default"]) groups[primary]["default"] = [];
        groups[primary]["default"].push(item);
      }
    });

    return Object.entries(groups).flatMap(([primary, secondaryGroups]) => {
      const allPrimaryItems = Object.values(secondaryGroups).flat();
      let primaryGroupAggregate: number | null = null;

      const aggregationMethod = primaryField.aggregation !== "none" ? primaryField.aggregation : "count";
      const values = allPrimaryItems.map((item: any) => {
        const fieldName = `${primaryField.type}_${primaryField.field}`;
        const value = item[fieldName];
        return typeof value === "number" ? value : 1;
      });

      switch (aggregationMethod) {
        case "sum":
          primaryGroupAggregate = values.reduce((a, b) => a + b, 0);
          break;
        case "average":
          primaryGroupAggregate = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case "count":
          primaryGroupAggregate = values.length;
          break;
        case "min":
          primaryGroupAggregate = values.length ? Math.min(...values) : 0;
          break;
        case "max":
          primaryGroupAggregate = values.length ? Math.max(...values) : 0;
          break;
      }

      const result: Grouped[] = [
        {
          group: primary,
          items: [],
          groupAggregate: primaryGroupAggregate,
          isPrimaryGroup: true
        }
      ];
      if (secondaryField) {
        Object.entries(secondaryGroups).forEach(([secondary, items]) => {
          let secondaryGroupAggregate: number | null = null;

          const values = (items as any[]).map(item => {
            const fieldName = `${primaryField.type}_${primaryField.field}`;
            const value = item[fieldName];
            return typeof value === "number" ? value : 1;
          });

          switch (aggregationMethod) {
            case "sum":
              secondaryGroupAggregate = values.reduce((a, b) => a + b, 0);
              break;
            case "average":
              secondaryGroupAggregate = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              break;
            case "count":
              secondaryGroupAggregate = values.length;
              break;
            case "min":
              secondaryGroupAggregate = values.length ? Math.min(...values) : 0;
              break;
            case "max":
              secondaryGroupAggregate = values.length ? Math.max(...values) : 0;
              break;
          }

          result.push({
            group: secondary,
            items,
            groupAggregate: secondaryGroupAggregate,
            isPrimaryGroup: false,
            parent: primary
          });
        });
      } else {
        result[0].items = allPrimaryItems;
      }
      return result;
    });
  }, [data, groupingFields]);

  useEffect(() => {
    let chart: echarts.ECharts | null = null;

    const initChart = () => {
      if (!chartRef.current) return;

      if (groupingFields.length > 1) {
        const primaryGroups = Array.from(new Set(groupedData.filter(g => g.isPrimaryGroup).map(g => g.group)));
        const secondaryGroups = Array.from(new Set(groupedData.filter(g => !g.isPrimaryGroup).map(g => g.group)));
        const series = primaryGroups.map(prim => {
          const data = secondaryGroups.map(sec => {
            const entry = groupedData.find(
              g => !g.isPrimaryGroup && g.group === sec && "parent" in g && g.parent === prim
            );
            return {
              name: sec,
              value: entry ? entry.groupAggregate || 0 : 0
            };
          });

          return {
            name: prim,
            type: "pie",
            radius: ["40%", "70%"],
            center: ["50%", "50%"],
            data,
            label: {
              show: true,
              formatter: "{b}: {c} ({d}%)"
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          };
        });

        const option = {
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          legend: {
            orient: "vertical",
            left: "left",
            data: secondaryGroups
          },
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
            trigger: "item",
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          series: [
            {
              name: groupingFields[0]?.field || "Wert",
              type: "pie",
              radius: "50%",
              data: chartData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)"
                }
              }
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
  }, [groupedData, groupingFields, chartInstance]);

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
