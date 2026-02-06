import Input from "./ui/Input";

type FilterStringFieldProps = {
  filterIndex: number;
  value: string;
  onChange: (nextValue: string) => void;
};

export default function FilterStringField({
  filterIndex,
  value,
  onChange
}: FilterStringFieldProps) {
  return (
    <Input
      name={`filter_${filterIndex}_value`}
      type="text"
      value={String(value)}
      onChange={e => onChange(e.target.value)}
      placeholder="Wert eingeben"
    />
  );
}
