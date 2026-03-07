import { Line, Image as KonvaImage } from "react-konva";
import { useEffect, useState } from "react";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";

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
  const spacing = gridSpacingFt * pxScale;

  // Vertical lines
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

  // Horizontal lines
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
