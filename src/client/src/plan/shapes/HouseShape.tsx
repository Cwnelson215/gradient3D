import { Line } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";

interface Props {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  onSelect: () => void;
}

export function HouseShape({ obj, scale, offsetX, offsetY, selected, onSelect }: Props) {
  const pxScale = PIXELS_PER_FOOT * scale;
  const flatPoints = obj.points.flatMap((p) => [
    (p[0] + obj.position.x) * pxScale + offsetX,
    (p[1] + obj.position.y) * pxScale + offsetY,
  ]);

  return (
    <Line
      points={flatPoints}
      closed
      fill={obj.style.fill ?? "#8B7355"}
      stroke={selected ? "#fff" : (obj.style.stroke ?? "#666")}
      strokeWidth={(obj.style.strokeWidth ?? 2) * (selected ? 1.5 : 1)}
      opacity={obj.style.opacity ?? 0.8}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
