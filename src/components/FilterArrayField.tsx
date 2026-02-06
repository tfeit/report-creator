import { XMarkIcon } from "@heroicons/react/24/outline";

interface FilterArrayFieldProps {
  selectedValues: string[];
  options: string[];
  onChange: (values: string[]) => void;
  onClear: () => void;
}

export default function FilterArrayField({
  selectedValues,
  options,
  onChange,
  onClear
}: FilterArrayFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/60 p-2 min-h-10 relative w-full">
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClear}
          aria-label="Auswahl leeren"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
        <div className="flex flex-wrap gap-2">
          {selectedValues.length === 0 ? (
            <></>
          ) : (
            selectedValues.map(value => (
              <span
                key={value}
                className="flex items-center gap-1 rounded-full bg-gray-200/80 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-800 dark:text-gray-100"
              >
                {value}
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => onChange(selectedValues.filter(entry => entry !== value))}
                  aria-label={`Auswahl entfernen: ${value}`}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600 bg-transparent p-2">
        {options.length === 0 ? (
          <div className="text-xs text-gray-400">Keine Optionen verfügbar</div>
        ) : (
          options.map(option => {
            const checked = selectedValues.includes(option);
            return (
              <label
                key={option}
                className="flex items-center gap-2 py-1 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const nextValues = checked
                      ? selectedValues.filter(entry => entry !== option)
                      : [...selectedValues, option];
                    onChange(nextValues);
                  }}
                />
                <span>{option}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
