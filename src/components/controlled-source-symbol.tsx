export function ControlledSource({
  x,
  y,
  kind = "voltage",
  label = "",
  down = false,
}: {
  x: number;
  y: number;
  kind?: "voltage" | "current";
  label?: string;
  down?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      data-symbol={`controlled-${kind}-source`}
    >
      <path d="M0 -25L18 0 0 25 -18 0Z" />
      {kind === "voltage" ? (
        <>
          <path d="M0 -25v50" />
          <text x="29" y="-13">
            +
          </text>
          <text x="29" y="23">
            −
          </text>
        </>
      ) : (
        <>
          <path d="M-18 0h36" />
          <path d={down ? "M0 31v21" : "M0 -31v-21"} />
          <path
            d={down ? "M0 55l-4 -8h8z" : "M0 -55l-4 8h8z"}
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
      <text x="-48" y={kind === "voltage" ? 5 : down ? 44 : -35}>
        {label}
      </text>
    </g>
  );
}
