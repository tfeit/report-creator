import Popup from "./ui/Popup";
import { useReport } from "../hooks/useReport";

export default function PopupDelete({ setShowPopup }: { setShowPopup: (show: boolean) => void }) {
  const { callbacks } = useReport();

  const handleDelete = async () => {
    try {
      const success = await callbacks.onDelete();
      if (success) {
        callbacks.onNavigateBack?.();
      } else {
        console.error("Error deleting report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      return false;
    }
  };

  return (
    <Popup  
      title="Bericht löschen"
      onClose={() => setShowPopup(false)}
      onClick={() => handleDelete()}
      onClickTitle={"Bericht löschen"}
      onBack={() => setShowPopup(false)}
      onBackTitle={"Abbrechen"}
    >
      <p>Möchtest du diesen Bericht wirklich löschen?</p>
    </Popup>
  );
}
