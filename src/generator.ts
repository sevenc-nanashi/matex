import paper from "paper-jsdom";
import fs from "node:fs/promises";

const clean = (item: paper.Item, color: paper.Color) => {
  const size = Math.max(item.bounds.width, item.bounds.height);
  for (const child of item.children) {
    if (child.bounds.width >= size || child.bounds.height >= size) {
      continue;
    }
    child.fillColor = color;
  }
};

export const size = 512;
const subIconScale = 0.5;
paper.setup(new paper.Size(size, size));

export const generate = async (svgPath: string, subSvgPath: string) => {
  const layer = new paper.Layer({ insert: false });
  const baseSvg = layer.importSVG(await fs.readFile(svgPath, "utf-8"));
  baseSvg.fitBounds(new paper.Rectangle(0, 0, size, size));
  baseSvg.strokeColor = null;
  clean(baseSvg, new paper.Color("#000000"));
  const subSvg = layer.importSVG(await fs.readFile(subSvgPath, "utf-8"));
  subSvg.fitBounds(
    new paper.Rectangle(
      size * (1 - subIconScale),
      size * (1 - subIconScale),
      size * subIconScale,
      size * subIconScale
    )
  );
  clean(subSvg, new paper.Color("#000000"));

  const thickSubSvg = subSvg.clone();
  const corner = new paper.Path.Rectangle(
    new paper.Rectangle(
      size * (1 - subIconScale),
      size * (1 - subIconScale),
      size * subIconScale,
      size * subIconScale
    )
  );

  for (const child of [...baseSvg.children]) {
    if (child.className.includes("Path")) {
      const subtracted = (child as paper.Path).subtract(corner, {
        insert: false,
      });
      child.remove();
      baseSvg.addChild(subtracted);
    }
  }
  paper.project.clear();
  paper.project.activeLayer.addChild(baseSvg);
  paper.project.activeLayer.addChild(thickSubSvg);
  const svg = paper.project.exportSVG({ asString: true });
  if (typeof svg !== "string") {
    throw new Error("Failed to export SVG");
  }

  return svg
    .replace(/#000000/g, "currentColor")
    .replace(/<svg[^>]+>/, "")
    .replace("</svg>", "");
};
