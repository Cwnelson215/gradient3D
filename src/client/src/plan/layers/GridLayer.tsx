import { Line, Image as KonvaImage } from "react-konva";
import { useEffect, useState } from "react";
import { PIXELS_PER_FOOT, getGridLevels, MIN_PIXEL_THRESHOLD } from "../../utils/coordinates";

interface Props {
  widthFt: number;
  depthFt: number;
  gridSpacingFt: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  backgroundImage?: string;
  stageWidth?: number;
  stageHeight?: number;
}

function coincides(value: number, spacing: number): boolean {
  const ratio = value / spacing;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
}

export function GridLayer({
  widthFt,
  depthFt,
  gridSpacingFt,
  scale,
  offsetX,
  offsetY,
  backgroundImage,
  stageWidth = 2000,
  stageHeight = 2000,
}: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const pxScale = PIXELS_PER_FOOT * scale;
  const w = widthFt * pxScale;
  const h = depthFt * pxScale;

  useEffect(() => {
    if (!backgroundImage) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.src = backgroundImage;
    image.onload = () => setImg(image);
  }, [backgroundImage]);

  const lines: React.ReactNode[] = [];

  // Viewport bounds in world coordinates (for culling fine grid lines)
  const viewMinXWorld = -offsetX / pxScale;
  const viewMaxXWorld = (stageWidth - offsetX) / pxScale;
  const viewMinYWorld = -offsetY / pxScale;
  const viewMaxYWorld = (stageHeight - offsetY) / pxScale;

  // Major grid lines (always drawn across full property)
  for (let x = 0; x <= widthFt; x += gridSpacingFt) {
    const px = x * pxScale + offsetX;
    lines.push(
      <Line
        key={`v${x}`}
        points={[px, offsetY, px, offsetY + h]}
        stroke="#333"
        strokeWidth={0.5}
      />
    );
  }
  for (let y = 0; y <= depthFt; y += gridSpacingFt) {
    const py = y * pxScale + offsetY;
    lines.push(
      <Line
        key={`h${y}`}
        points={[offsetX, py, offsetX + w, py]}
        stroke="#333"
        strokeWidth={0.5}
      />
    );
  }

  // Progressive fine grid levels (adaptive to major grid spacing)
  const gridLevels = getGridLevels(gridSpacingFt);
  const visibleLevels = gridLevels.filter(
    (level) => level.spacingFt * pxScale >= MIN_PIXEL_THRESHOLD
  );

  for (const level of visibleLevels) {
    const spacing = level.spacingFt;

    // Coarser spacings that this level should skip (major grid + any coarser fine levels)
    const coarserSpacings = [gridSpacingFt, ...gridLevels.filter(l => l.spacingFt > spacing).map(l => l.spacingFt)];

    // Integer-based iteration to avoid floating point accumulation
    const iXStart = Math.max(0, Math.floor(viewMinXWorld / spacing));
    const iXEnd = Math.min(Math.ceil(widthFt / spacing), Math.ceil(viewMaxXWorld / spacing));
    const iYStart = Math.max(0, Math.floor(viewMinYWorld / spacing));
    const iYEnd = Math.min(Math.ceil(depthFt / spacing), Math.ceil(viewMaxYWorld / spacing));

    // Clip line endpoints to property bounds
    const lineYStart = offsetY;
    const lineYEnd = offsetY + h;
    const lineXStart = offsetX;
    const lineXEnd = offsetX + w;

    for (let i = iXStart; i <= iXEnd; i++) {
      const x = i * spacing;
      if (x > widthFt) break;
      if (coarserSpacings.some(cs => coincides(x, cs))) continue;
      const px = x * pxScale + offsetX;
      lines.push(
        <Line
          key={`fv-${level.label}-${i}`}
          points={[px, lineYStart, px, lineYEnd]}
          stroke={level.stroke}
          strokeWidth={level.strokeWidth}
        />
      );
    }
    for (let i = iYStart; i <= iYEnd; i++) {
      const y = i * spacing;
      if (y > depthFt) break;
      if (coarserSpacings.some(cs => coincides(y, cs))) continue;
      const py = y * pxScale + offsetY;
      lines.push(
        <Line
          key={`fh-${level.label}-${i}`}
          points={[lineXStart, py, lineXEnd, py]}
          stroke={level.stroke}
          strokeWidth={level.strokeWidth}
        />
      );
    }
  }

  return (
    <>
      {img && (
        <KonvaImage
          image={img}
          x={offsetX}
          y={offsetY}
          width={w}
          height={h}
          opacity={0.5}
        />
      )}
      {lines}
      {/* Property outline */}
      <Line
        points={[
          offsetX, offsetY,
          offsetX + w, offsetY,
          offsetX + w, offsetY + h,
          offsetX, offsetY + h,
        ]}
        closed
        stroke="#555"
        strokeWidth={1}
      />
    </>
  );
}
