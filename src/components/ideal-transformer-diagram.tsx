export function IdealTransformerDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 600 320"
        role="img"
        aria-label="理想变压器，两电流均流入同名端"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M90 60H220V85c-35 0-35 30 0 30c-35 0-35 30 0 30c-35 0-35 30 0 30c-35 0-35 30 0 30V255H90M510 60H380V85c35 0 35 30 0 30c35 0 35 30 0 30c35 0 35 30 0 30c35 0 35 30 0 30V255H510M285 75V235M305 75V235" />
          <circle cx="236" cy="75" r="4" fill="currentColor" />
          <circle cx="364" cy="75" r="4" fill="currentColor" />
          <path d="M140 45H190m-8 -4l8 4-8 4M460 45H410m8 -4l-8 4 8 4" />
        </g>
        <g fill="currentColor" fontSize="17">
          <text x="125" y="32">
            i₁
          </text>
          <text x="435" y="32">
            i₂
          </text>
          <text x="120" y="140">
            + u₁
          </text>
          <text x="120" y="228">
            −
          </text>
          <text x="445" y="140">
            + u₂
          </text>
          <text x="445" y="228">
            −
          </text>
          <text x="245" y="290">
            n = N₁ / N₂
          </text>
        </g>
      </svg>
      <figcaption>
        两电压同名端为正，两绕组电流均流入同名端；此约定下
        i₁=−i₂/n。图为理想变压器，不含实际变压器磁化支路。
      </figcaption>
    </figure>
  );
}
