type PartProps = { x: number; y: number; label?: string };
function SymbolLabel({ x, y, label }: { x: number; y: number; label: string }) {
  const [base, subscript] = label.split("_");
  return (
    <text x={x} y={y} className="symbol-label">
      {base}
      {subscript && (
        <tspan baselineShift="sub" fontSize="11">
          {subscript}
        </tspan>
      )}
    </text>
  );
}
export function Wire({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} />;
}
export function Resistor({ x, y, label = "R" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0h20m50 0h20" />
      <rect x="20" y="-10" width="50" height="20" />
      <SymbolLabel x={45} y={-20} label={label} />
    </g>
  );
}
export function Capacitor({ x, y, label = "C" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0h38m0 -18v36m14 -36v36m0 -18h38" />
      <SymbolLabel x={45} y={-28} label={label} />
    </g>
  );
}
export function Inductor({ x, y, label = "L" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0h15a7.5 10 0 0 1 15 0a7.5 10 0 0 1 15 0a7.5 10 0 0 1 15 0a7.5 10 0 0 1 15 0h15" />
      <SymbolLabel x={45} y={-24} label={label} />
    </g>
  );
}
// Qiu Guanyuan, Circuit (5th ed.), p.16 fig.1-8: axial line, external polarity.
export function VoltageSource({ x, y, label = "U_S" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`} data-symbol="voltage-source">
      <circle r="24" />
      <path d="M0 -24v48" />
      <text x="32" y="-13">
        +
      </text>
      <text x="32" y="23">
        −
      </text>
      <SymbolLabel x={-45} y={5} label={label} />
    </g>
  );
}
// p.18 fig.1-10: transverse line; the current arrow sits outside the circle.
export function CurrentSource({ x, y, label = "I_S" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`} data-symbol="current-source">
      <circle r="24" />
      <path d="M-24 0h48M0 -31v-21" />
      <path d="M0 -54l-4 8h8z" fill="currentColor" stroke="none" />
      <SymbolLabel x={-45} y={-33} label={label} />
    </g>
  );
}
export function Ground({ x, y, label = "0 V" }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v10m-15 0h30m-10 6h-10m3 6h4" />
      <text x="40" y="20">
        {label}
      </text>
    </g>
  );
}
export function Node({ x, y, label = "" }: PartProps) {
  return (
    <g>
      <circle cx={x} cy={y} r="4" fill="currentColor" />
      <SymbolLabel x={x} y={y - 15} label={label} />
    </g>
  );
}
