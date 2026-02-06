import Input from "./ui/Input";

type FilterNumberFieldProps = {
  filterIndex: number;
  value: string;
  operator: string;
  onChange: (nextValue: string) => void;
};

export default function FilterNumberField({
  filterIndex,
  value,
  operator,
  onChange
}: FilterNumberFieldProps) {
  if (operator === "between") {
    const [from, to] = String(value).split("|");
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          name={`filter_${filterIndex}_from`}
          label="Von"
          type="number"
          value={from || ""}
          onChange={e => onChange(`${e.target.value}|${to || ""}`)}
          placeholder="Von"
        />
        <Input
          name={`filter_${filterIndex}_to`}
          label="Bis"
          type="number"
          value={to || ""}
          onChange={e => onChange(`${from || ""}|${e.target.value}`)}
          placeholder="Bis"
        />
      </div>
    );
  }

  return (
    <Input
      name={`filter_${filterIndex}_value`}
      type="number"
      value={String(value)}
      onChange={e => onChange(e.target.value)}
      placeholder="Wert eingeben"
    />
  );
}
