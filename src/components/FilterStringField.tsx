import Input from "./ui/Input";

type FilterStringFieldProps = {
  groupIndex: number;
  filterIndex: number;
  value: string;
  onChange: (nextValue: string) => void;
};

export default function FilterStringField({
  groupIndex,
  filterIndex,
  value,
  onChange
}: FilterStringFieldProps) {
  return (
    <Input
      name={`filter_${groupIndex}_${filterIndex}_value`}
      type="text"
      value={String(value)}
      onChange={e => onChange(e.target.value)}
      placeholder="Wert eingeben"
    />
  );
}
