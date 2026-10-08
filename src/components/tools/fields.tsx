export function Field({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="待求"
        />
        <span>{unit}</span>
      </div>
    </label>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="input-error" role="alert">
      {message}
    </p>
  );
}
