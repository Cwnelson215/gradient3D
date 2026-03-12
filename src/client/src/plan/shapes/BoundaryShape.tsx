import { Line, Circle } from "react-konva";
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

export function BoundaryShape({ obj, scale, offsetX, offsetY, selected, onSelect }: Props) {
  const pxScale = PIXELS_PER_FOOT * scale;
  const flatPoints = obj.points.flatMap((p) => [
    (p[0] + obj.position.x) * pxScale + offsetX,
    (p[1] + obj.position.y) * pxScale + offsetY,
  ]);

  return (
    <>
      <Line
        points={flatPoints}
        closed
        stroke={selected ? "#fff" : (obj.style.stroke ?? "#ffcc00")}
        strokeWidth={(obj.style.strokeWidth ?? 2) * (selected ? 1.5 : 1)}
        dash={[8, 4]}
        fill="transparent"
        opacity={obj.style.opacity ?? 1}
        onClick={onSelect}
        onTap={onSelect}
      />
      {obj.points.map((p, i) => (
        <Circle
          key={i}
          x={(p[0] + obj.position.x) * pxScale + offsetX}
          y={(p[1] + obj.position.y) * pxScale + offsetY}
          radius={selected ? 4 : 2}
          fill={selected ? "#fff" : "#ffcc00"}
          onClick={onSelect}
          onTap={onSelect}
        />
      ))}
    </>
  );
}
