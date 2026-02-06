import { RectangleStackIcon, Square3Stack3DIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import IconCheckbox from "./ui/IconCheckbox";
import Popup from "./ui/Popup";
import { useReport } from "../hooks/useReport";
import { WorkspaceListing } from "../types";

export default function PopupChangeData({ setShowPopup }: { setShowPopup: (show: boolean) => void }) {
  const { report, refetch, refetchContent, callbacks, workspaceCollections, workspaceListings } = useReport();

  const [reportBase, setReportBase] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedListings, setSelectedListings] = useState<WorkspaceListing[]>([]);

  const collections = workspaceCollections?.map(collection => ({
    value: collection.uuid,
    label: collection.title
  })) || [];

  const handleSelectionSelect = (collection: string) => {
    setSelectedCollection(collection);
    setSelectedListings([]);
  };

  const availableListings = workspaceListings?.filter(
    listing => !selectedListings.some(selected => selected.listingId === listing.listingId)
  );

  const handleSelectListing = (option: string) => {
    const selected = workspaceListings?.find(listing => listing.listingId === option);
    if (selected && !selectedListings.some(listing => listing.listingId === selected.listingId)) {
      setSelectedListings(prev => [...prev, selected]);
    }
    setSelectedCollection("");
  };

  const removeListing = (listingId?: string) => {
    if (!listingId) return;
    setSelectedListings(prev => prev.filter(listing => listing.listingId !== listingId));
  };

  const renderSelect = (
    name: string,
    value: string,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
    options: { value: string; label: string }[]
  ) => (
    <select
    name={name} value={value} onChange={onChange}>
      <option value="">Auswählen</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const renderSelectedListings = () => (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Ausgewählte Einträge:</h3>
      <div className="flex flex-wrap gap-2">
        {selectedListings.map(listing => (
          <div
            key={listing.listingId}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-100/10 rounded-full px-3 py-1"
          >
            <span>{listing.name}</span>
            <button
              onClick={() => removeListing(listing.listingId)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const listingOptions =
    availableListings?.map(listing => ({ value: listing.listingId, label: listing.name })) || [];

  let conditions = "";
  if (reportBase === "collection") {
    conditions = JSON.stringify([{ key: "collection_id", value: selectedCollection, operator: "=" }]);
  } else if (reportBase === "listings") {
    conditions = JSON.stringify(
      selectedListings.map(listing => ({ key: "listing_id", value: listing.listingId, operator: "=" }))
    );
  }

  const handleSubmit = async () => {
    const success = await callbacks.onUpdateConditions(conditions);
    if (success) {
      setShowPopup(false);
      refetch();
      refetchContent();
    }
  };

  useEffect(() => {
    if (report?.conditions) {
      try {
        const parsedConditions =
          typeof report.conditions === "string" ? JSON.parse(report.conditions) : report.conditions;

        if (Array.isArray(parsedConditions) && parsedConditions.length > 0) {
          const collectionCondition = parsedConditions.find((cond: any) => cond.key === "collection_id");
          if (collectionCondition) {
            setReportBase("collection");
            setSelectedCollection(collectionCondition.value);
            setSelectedListings([]);
            return;
          }
        }

        if (parsedConditions && Array.isArray(parsedConditions)) {
          const listingConditions = parsedConditions.filter((cond: any) => cond.key === "listing_id");
          if (listingConditions.length > 0) {
            setReportBase("listings");
            setSelectedCollection("");

            const selectedListingIds = listingConditions.map((cond: any) => cond.value);
            const foundListings = workspaceListings?.filter(listing =>
              selectedListingIds.includes(listing.listingId)
            ) || [];
            setSelectedListings(foundListings);
            return;
          }
        }
      } catch (error) {
        console.error("Fehler beim Parsen der Bedingungen:", error);
      }
    }
  }, [report?.conditions, workspaceListings]);

  return (
    <Popup
      title="Datenbasis"
      onClose={() => setShowPopup(false)}
      onClick={() => handleSubmit()}
      onClickTitle={"Aktualisieren"}
      onBack={() => setShowPopup(false)}
      onBackTitle={"Abbrechen"}
    >
      <div id="report-setup-step-1" className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 w-full justify-between">
            <IconCheckbox
              key={"listings"}
              icon={<Square3Stack3DIcon className="min-w-6 min-h-6" />}
              label={"Einträge"}
              isChecked={reportBase === "listings"}
              iconPosition="left"
              onChange={() => setReportBase("listings")}
              id={"listings"}
            />

            <IconCheckbox
              key={"collection"}
              icon={<RectangleStackIcon className="min-w-6 min-h-6" />}
              label={"Sammlungen"}
              isChecked={reportBase === "collection"}
              iconPosition="left"
              onChange={() => setReportBase("collection")}
              id={"collection"}
            />
          </div>
        </div>

        {reportBase === "collection" &&
          renderSelect("selectedCollection", selectedCollection, e => handleSelectionSelect(e.target.value), collections)}

        {reportBase === "listings" && (
          <>
            {renderSelect(
              "selectedListings",
              selectedListings.map(listing => listing.listingId).join(","),
              e => handleSelectListing(e.target.value),
              listingOptions
            )}
            {selectedListings.length > 0 && renderSelectedListings()}
          </>
        )}
      </div>
    </Popup>
  );
}
