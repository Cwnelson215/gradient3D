import Konva from "konva";
import type { LandscapeObject, PropertyConfig } from "../types/landscape";
import { PIXELS_PER_FOOT, polygonArea, polylineLength } from "../utils/coordinates";
import { computeMaterialSummary } from "./materialSummary";

export interface PrintOptions {
  projectName: string;
  background: "dark" | "white";
  showTitleBlock: boolean;
  showScaleBar: boolean;
  showLegend: boolean;
  showNorthArrow: boolean;
  resolution: number; // 2 or 3
}

export function generatePrintLayout(
  sourceStage: Konva.Stage,
  objects: LandscapeObject[],
  property: PropertyConfig,
  options: PrintOptions
): string {
  const { resolution } = options;
  const margin = 60;
  const titleBlockHeight = options.showTitleBlock ? 60 : 0;
  const legendWidth = options.showLegend ? 180 : 0;

  // Compute canvas dimensions
  const planWidth = property.widthFt * PIXELS_PER_FOOT;
  const planHeight = property.depthFt * PIXELS_PER_FOOT;
  const totalWidth = planWidth + margin * 2 + legendWidth;
  const totalHeight = planHeight + margin * 2 + titleBlockHeight;

  // Create offscreen stage
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const stage = new Konva.Stage({
    container,
    width: totalWidth * resolution,
    height: totalHeight * resolution,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Scale everything by resolution
  layer.scale({ x: resolution, y: resolution });

  // Background
  const bgColor = options.background === "white" ? "#ffffff" : "#0f0f14";
  const textColor = options.background === "white" ? "#333333" : "#e0e0e8";
  const mutedColor = options.background === "white" ? "#888888" : "#8888a0";
  const borderColor = options.background === "white" ? "#cccccc" : "#2a2a3a";

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: totalWidth,
      height: totalHeight,
      fill: bgColor,
    })
  );

  // Clone visible layers from source stage into print layout
  // We use toDataURL from the source stage for the plan area
  const planDataUrl = sourceStage.toDataURL({
    pixelRatio: resolution,
  });

  // Plan border
  layer.add(
    new Konva.Rect({
      x: margin,
      y: margin,
      width: planWidth,
      height: planHeight,
      stroke: borderColor,
      strokeWidth: 1,
    })
  );

  // Title block
  if (options.showTitleBlock) {
    const tbY = totalHeight - titleBlockHeight;
    layer.add(
      new Konva.Line({
        points: [margin, tbY, totalWidth - margin - legendWidth, tbY],
        stroke: borderColor,
        strokeWidth: 1,
      })
    );
    layer.add(
      new Konva.Text({
        x: margin + 12,
        y: tbY + 12,
        text: options.projectName || "Landscape Plan",
        fill: textColor,
        fontSize: 18,
        fontFamily: "Inter, sans-serif",
        fontStyle: "600",
      })
    );
    layer.add(
      new Konva.Text({
        x: margin + 12,
        y: tbY + 36,
        text: `${property.widthFt} ft × ${property.depthFt} ft  |  ${new Date().toLocaleDateString()}`,
        fill: mutedColor,
        fontSize: 11,
        fontFamily: "Inter, sans-serif",
      })
    );
  }

  // Scale bar
  if (options.showScaleBar) {
    const sbY = totalHeight - titleBlockHeight - 30;
    const sbX = margin + 12;
    const scaleLen = 10; // 10 ft
    const scalePx = scaleLen * PIXELS_PER_FOOT;

    layer.add(
      new Konva.Line({
        points: [sbX, sbY, sbX + scalePx, sbY],
        stroke: textColor,
        strokeWidth: 2,
      })
    );
    layer.add(
      new Konva.Line({
        points: [sbX, sbY - 4, sbX, sbY + 4],
        stroke: textColor,
        strokeWidth: 2,
      })
    );
    layer.add(
      new Konva.Line({
        points: [sbX + scalePx, sbY - 4, sbX + scalePx, sbY + 4],
        stroke: textColor,
        strokeWidth: 2,
      })
    );
    layer.add(
      new Konva.Text({
        x: sbX + scalePx / 2,
        y: sbY + 6,
        text: `${scaleLen} ft`,
        fill: mutedColor,
        fontSize: 10,
        fontFamily: "Inter, sans-serif",
        align: "center",
        offsetX: 15,
      })
    );
  }

  // North arrow
  if (options.showNorthArrow) {
    const naX = totalWidth - margin - legendWidth - 40;
    const naY = margin + 30;

    layer.add(
      new Konva.Line({
        points: [naX, naY + 20, naX, naY - 20],
        stroke: textColor,
        strokeWidth: 2,
      })
    );
    layer.add(
      new Konva.Line({
        points: [naX - 6, naY - 12, naX, naY - 20, naX + 6, naY - 12],
        stroke: textColor,
        strokeWidth: 2,
        closed: true,
        fill: textColor,
      })
    );
    layer.add(
      new Konva.Text({
        x: naX - 3,
        y: naY - 36,
        text: "N",
        fill: textColor,
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        fontStyle: "600",
      })
    );
  }

  // Legend
  if (options.showLegend) {
    const lx = totalWidth - legendWidth - margin + 20;
    let ly = margin + 12;

    layer.add(
      new Konva.Text({
        x: lx,
        y: ly,
        text: "Legend",
        fill: textColor,
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        fontStyle: "600",
      })
    );
    ly += 24;

    const summary = computeMaterialSummary(objects);
    for (const item of summary) {
      layer.add(
        new Konva.Text({
          x: lx,
          y: ly,
          text: `${item.label} (${item.count})`,
          fill: mutedColor,
          fontSize: 10,
          fontFamily: "Inter, sans-serif",
        })
      );
      ly += 14;

      if (item.totalArea !== undefined) {
        layer.add(
          new Konva.Text({
            x: lx + 8,
            y: ly,
            text: `${item.totalArea.toFixed(0)} sq ft`,
            fill: mutedColor,
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
          })
        );
        ly += 14;
      }
      if (item.totalLength !== undefined) {
        layer.add(
          new Konva.Text({
            x: lx + 8,
            y: ly,
            text: `${item.totalLength.toFixed(0)} ft`,
            fill: mutedColor,
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
          })
        );
        ly += 14;
      }
    }
  }

  layer.draw();

  // Get the data URL from source stage (which has the actual plan rendering)
  const dataUrl = sourceStage.toDataURL({ pixelRatio: resolution });

  // Clean up
  stage.destroy();
  document.body.removeChild(container);

  return dataUrl;
}
