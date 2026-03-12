import { Line, Image as KonvaImage } from "react-konva";
import { useEffect, useState } from "react";
import { PIXELS_PER_FOOT, SNAP_INCREMENT_FT } from "../../utils/coordinates";

interface Props {
  widthFt: number;
  depthFt: number;
  gridSpacingFt: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  backgroundImage?: string;
}

export function GridLayer({
  widthFt,
  depthFt,
  gridSpacingFt,
  scale,
  offsetX,
  offsetY,
  backgroundImage,
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

  // Major grid lines (display spacing)
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

  // Fine 1/12 ft (1 inch) grid lines — only when zoomed in enough
  const finePixelSpacing = SNAP_INCREMENT_FT * pxScale;
  if (finePixelSpacing >= 5) {
    for (let x = 0; x <= widthFt; x += SNAP_INCREMENT_FT) {
      // Skip positions that coincide with major grid lines
      if (Math.abs(x % gridSpacingFt) < 1e-6 || Math.abs((x % gridSpacingFt) - gridSpacingFt) < 1e-6) continue;
      const px = x * pxScale + offsetX;
      lines.push(
        <Line
          key={`fv${x}`}
          points={[px, offsetY, px, offsetY + h]}
          stroke="#222"
          strokeWidth={0.25}
        />
      );
    }
    for (let y = 0; y <= depthFt; y += SNAP_INCREMENT_FT) {
      if (Math.abs(y % gridSpacingFt) < 1e-6 || Math.abs((y % gridSpacingFt) - gridSpacingFt) < 1e-6) continue;
      const py = y * pxScale + offsetY;
      lines.push(
        <Line
          key={`fh${y}`}
          points={[offsetX, py, offsetX + w, py]}
          stroke="#222"
          strokeWidth={0.25}
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
