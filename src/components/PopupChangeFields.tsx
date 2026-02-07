import { useState } from "react";
import Popup from "./ui/Popup";
import FieldSelector from "./FieldSelector";
import { Field } from "../types";
import { useReport } from "../hooks/useReport";

export default function PopupChangeFields({ setShowPopup }: { setShowPopup: (show: boolean) => void }) {
  const {
    report,
    refetch,
    displayFields: contextDisplayFields,
    setDisplayFields: setContextDisplayFields,
    callbacks,
    config
  } = useReport();

  const [displayFields, setDisplayFields] = useState<Field[]>(() => {
    return contextDisplayFields || [];
  });

  const handleSubmit = async () => {
    const success = await callbacks.onUpdateFields(displayFields);

    if (success) {
      setContextDisplayFields(displayFields);
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
      {(() => {
        const reportType = report?.type || "";
        const configuredTypes = config.reportTypeEntities?.[reportType];
        const fallbackTypes = Object.keys(config.fieldsByEntity ?? {});
        const types = configuredTypes && configuredTypes.length > 0 ? configuredTypes : fallbackTypes;
        return types;
      })().map(type => (
        <FieldSelector
          key={type}
          type={type}
          reportType={report?.type || ""}
          displayFields={displayFields}
          onDisplayFieldsChange={setDisplayFields}
          placeholder="Felder auswählen"
          config={config}
        />
      ))}
    </Popup>
  );
}
