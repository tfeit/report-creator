import Input from "./ui/Input";

type FilterDateFieldProps = {
  groupIndex: number;
  filterIndex: number;
  value: string;
  operator: string;
  onChange: (nextValue: string) => void;
};

export default function FilterDateField({
  groupIndex,
  filterIndex,
  value,
  operator,
  onChange
}: FilterDateFieldProps) {
  if (operator === "between") {
    const [from, to] = String(value).split("|");
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          name={`filter_${groupIndex}_${filterIndex}_from`}
          label="Von"
          type="date"
          value={from || ""}
          onChange={e => onChange(`${e.target.value}|${to || ""}`)}
          placeholder="Von"
        />
        <Input
          name={`filter_${groupIndex}_${filterIndex}_to`}
          label="Bis"
          type="date"
          value={to || ""}
          onChange={e => onChange(`${from || ""}|${e.target.value}`)}
          placeholder="Bis"
        />
      </div>
    );
  }

  return (
    <Input
      name={`filter_${groupIndex}_${filterIndex}_value`}
      type="date"
      value={String(value)}
      onChange={e => onChange(e.target.value)}
      placeholder="Wert eingeben"
    />
  );
}
