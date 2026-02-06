import { useState } from "react";
import Popup from "./ui/Popup";
import FieldSelector from "./FieldSelector";
import { DisplayField, MetaDisplayFields } from "../types";
import { useReport } from "../hooks/useReport";

const FIELD_TYPES = ["organisation", "organisation_statistics", "school", "offer", "output"] as const;

export default function PopupChangeFields({ setShowPopup }: { setShowPopup: (show: boolean) => void }) {
  const { report, refetch, displayFields: contextDisplayFields, setDisplayFields: setContextDisplayFields, callbacks } = useReport();

  const [displayFields, setDisplayFields] = useState<DisplayField[]>(() => {
    return contextDisplayFields as unknown as DisplayField[] || [];
  });

  const handleSubmit = async () => {
    const success = await callbacks.onUpdateFields(displayFields as unknown as MetaDisplayFields);

    if (success) {
      setContextDisplayFields(displayFields as unknown as MetaDisplayFields);
      setShowPopup(false);
      refetch();
    }
  };

  return (
    <Popup
      title="Felder"
      onClose={() => setShowPopup(false)}
      onClick={() => handleSubmit()}
      onClickTitle={"Aktualisieren"}
      onBack={() => setShowPopup(false)}
      onBackTitle={"Abbrechen"}
    >
      {FIELD_TYPES.map(type => (
        <FieldSelector
          key={type}
          type={type}
          reportType={report?.type || ""}
          displayFields={displayFields as unknown as MetaDisplayFields}
          onDisplayFieldsChange={setDisplayFields as unknown as (newFields: MetaDisplayFields) => void}
          placeholder="Felder auswählen"
        />
      ))}
    </Popup>
  );
}
