/** Browser geometry audit in root SVG coordinates; includes nested transforms. */
export function auditSvg(svg) {
  const labels = [...svg.querySelectorAll("text")].filter(
    (text) => text.textContent.trim() && !text.closest("defs"),
  );
  const shapes = [
    ...svg.querySelectorAll("path,line,polyline,polygon,rect,circle,ellipse"),
  ].filter(
    (shape) =>
      !shape.closest("defs") && getComputedStyle(shape).stroke !== "none",
  );
  const box = (element) => {
    const b = element.getBBox();
    const matrix = svg.getCTM().inverse().multiply(element.getCTM());
    const corners = [
      [b.x, b.y],
      [b.x + b.width, b.y],
      [b.x, b.y + b.height],
      [b.x + b.width, b.y + b.height],
    ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
    return {
      x: Math.min(...corners.map((p) => p.x)),
      y: Math.min(...corners.map((p) => p.y)),
      right: Math.max(...corners.map((p) => p.x)),
      bottom: Math.max(...corners.map((p) => p.y)),
    };
  };
  const labelBoxes = labels.map(box);
  const shapeBoxes = shapes.map(box);
  const collisions = [];
  labels.forEach((label, i) => {
    const a = labelBoxes[i];
    const view = svg.viewBox.baseVal;
    if (
      a.x < view.x - 0.5 ||
      a.y < view.y - 0.5 ||
      a.right > view.x + view.width + 0.5 ||
      a.bottom > view.y + view.height + 0.5
    )
      collisions.push({
        kind: "clipped",
        label: label.textContent,
        box: a,
      });
    for (let j = i + 1; j < labels.length; j++) {
      const b = labelBoxes[j];
      if (
        Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1
      )
        collisions.push({
          kind: "text",
          label: label.textContent,
          other: labels[j].textContent,
        });
    }
    shapes.forEach((shape, j) => {
      const b = shapeBoxes[j];
      const left = Math.max(a.x + 1, b.x - 2),
        right = Math.min(a.right - 1, b.right + 2),
        top = Math.max(a.y + 1, b.y - 2),
        bottom = Math.min(a.bottom - 1, b.bottom + 2);
      if (left > right || top > bottom) return;
      const matrix = svg.getCTM().inverse().multiply(shape.getCTM()).inverse();
      for (let y = top; y <= bottom; y += 1)
        for (let x = left; x <= right; x += 1) {
          if (
            shape.isPointInStroke(new DOMPoint(x, y).matrixTransform(matrix))
          ) {
            collisions.push({
              kind: "stroke",
              label: label.textContent,
              shape: shape.tagName,
              geometry:
                shape.getAttribute("d") ||
                [
                  shape.getAttribute("x1"),
                  shape.getAttribute("y1"),
                  shape.getAttribute("x2"),
                  shape.getAttribute("y2"),
                ].join(","),
            });
            return;
          }
        }
    });
  });
  return {
    title:
      svg.getAttribute("aria-label") ||
      svg.querySelector("title")?.textContent ||
      "SVG",
    labels: labels.map((label) => label.textContent),
    collisions,
  };
}
