"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  CircleStackIcon,
  FunnelIcon,
  PencilIcon,
  Squares2X2Icon,
  TrashIcon
} from "@heroicons/react/24/outline";
import DropdownMenu, { Action } from "./ui/DropdownMenu";
import { useReportOperations } from "../hooks/useReportOperations";
import { handleExport } from "../utils/utils";
import PopupDelete from "./PopupDelete";
import ReportTable from "./ReportTable";
import ReportFilters from "./ReportFilters";
import ReportSort from "./ReportSort";
import ReportAggregation from "./ReportAggregation";
import { useReport } from "../hooks/useReport";
import ReportTitle from "./ReportTitle";

const PopupChangeData = lazy(() => import("./PopupChangeData"));
const PopupChangeFields = lazy(() => import("./PopupChangeFields"));

export default function ReportInner() {
  const { report, refetch, refetchContent, reportContent, displayFields, filters } = useReport();
  const { handleGroupByColumn, handleSortByColumn } = useReportOperations();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showAggregation, setShowAggregation] = useState(false);

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filtersOverflowVisible, setFiltersOverflowVisible] = useState(false);
  const [renderFilters, setRenderFilters] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showPopupData, setShowPopupData] = useState(false);
  const [showPopupTitle, setShowPopupTitle] = useState(false);
  const [showPopupDelete, setShowPopupDelete] = useState(false);

  const hasActiveSort = useMemo(
    () => displayFields.some(field => Boolean(field.sort)),
    [displayFields]
  );
  const hasActiveAggregation = useMemo(
    () => displayFields.some(field => Boolean(field.grouping)),
    [displayFields]
  );
  const hasActiveFilters = useMemo(
    () => filters.some(group => group.filters.length > 0),
    [filters]
  );

  console.log(filters);

  useEffect(() => {
    const transitionMs = 300;
    const showFiltersOrSort = showFilters || showSort || showAggregation;
    let expandTimer: ReturnType<typeof setTimeout> | undefined;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;
    let rafId: number | undefined;

    if (showFiltersOrSort) {
      setRenderFilters(true);
      setFiltersOverflowVisible(false);
      rafId = requestAnimationFrame(() => setFiltersExpanded(true));
      expandTimer = setTimeout(() => {
        setFiltersOverflowVisible(true);
      }, transitionMs);
    } else {
      setFiltersOverflowVisible(false);
      rafId = requestAnimationFrame(() => setFiltersExpanded(false));
      unmountTimer = setTimeout(() => {
        setRenderFilters(false);
      }, transitionMs);
    }

    return () => {
      if (expandTimer) clearTimeout(expandTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [showFilters, showSort, showAggregation]);

  const handleExportClick = () => {
    handleExport(reportContent, report, displayFields);
  };

  const actions = [
    {
      type: "button",
      icon: PencilIcon,
      label: "Titel",
      onClick: () => {
        setShowPopupTitle(true);
      }
    },
    {
      type: "button",
      icon: CircleStackIcon,
      label: "Daten",
      onClick: () => {
        setShowPopupData(true);
      }
    },
    {
      type: "button",
      icon: PencilIcon,
      label: "Felder",
      onClick: () => {
        setShowPopup(true);
      }
    },
    { type: "button", icon: ArrowDownTrayIcon, label: "Exportieren", onClick: handleExportClick },
    { type: "divider" },
    {
      type: "button",
      icon: TrashIcon,
      label: "Löschen",
      onClick: () => {
        setShowPopupDelete(true);
      }
    }
  ];

  return (
    <>
      <div id="report-wrapper" className="flex flex-col lg:h-[calc(100vh-4rem)]">
        <ReportTitle
          title={(report?.title as string) || ""}
          enableEdit={showPopupTitle}
          setEnableEdit={setShowPopupTitle}
          showIcon={true}
          iconLink={`/berichte`}
        >
          <div className="actions">
            <button
              title="Filter"
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters || hasActiveFilters ? "action selected" : "action"}`}
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
            
            <button
              title="Sortierung"
              onClick={() => setShowSort(!showSort)}
              className={`${showSort || hasActiveSort ? "action selected" : "action"}`}
            >
              <ArrowsUpDownIcon className="w-5 h-5" />
            </button>
            
            <button
              title="Gruppierung"
              onClick={() => setShowAggregation(!showAggregation)}
              className={`${showAggregation || hasActiveAggregation ? "action selected" : "action"}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>

            <button
              title="Diagramm"
              onClick={() => setShowChart(!showChart)}
              className={`${showChart ? "action selected" : "action"}`}
              disabled={!hasActiveAggregation}
            >
              <ChartBarIcon className="w-5 h-5" />
            </button>
            
            <button
              title="Aktualisieren"
              onClick={() => {
                refetch();
                refetchContent();
              }}
              className="action"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            <DropdownMenu 
              icon={AdjustmentsHorizontalIcon}
              buttonSize="square" 
              buttonRounded="full" 
              buttonColor="transparent" 
              renderMode="absolute"
              actions={actions as Action[]} 
            />
          </div>
        </ReportTitle>

        <div
          className={`report-settings-wrapper ${
            filtersExpanded
              ? "open"
              : "closed"
          }`}
          style={{
            overflow: filtersOverflowVisible ? "visible" : "hidden"
          }}
        >
          {renderFilters && (
            <>
              {(showAggregation || hasActiveAggregation) && <ReportAggregation />}
              {(showSort || hasActiveSort) &&
                (showAggregation || hasActiveAggregation) && (
                  <span className="text-gray-500 select-none px-2">|</span>
                )}
              {(showSort || hasActiveSort) && <ReportSort />}
              {(showSort || hasActiveSort) &&
                (showFilters || hasActiveFilters) && (
                  <span className="text-gray-500 select-none px-2">|</span>
                )}
              {(showFilters || hasActiveFilters) && <ReportFilters />}
            </>
          )}
        </div>

        <div className="overflow-y-scroll">
          <ReportTable 
            handleGroupByColumn={handleGroupByColumn} 
            handleSortByColumn={handleSortByColumn} 
            showChart={showChart}
          />
        </div>
      </div>

      {showPopup && (
        <Suspense fallback={<></>}>
          <PopupChangeFields setShowPopup={setShowPopup} />
        </Suspense>
      )}
      {showPopupData && (
        <Suspense fallback={<></>}>
          <PopupChangeData setShowPopup={setShowPopupData} />
        </Suspense>
      )}
      {showPopupDelete && (
        <Suspense fallback={<></>}>
          <PopupDelete setShowPopup={setShowPopupDelete} />
        </Suspense>
      )}
    </>
  );
}
