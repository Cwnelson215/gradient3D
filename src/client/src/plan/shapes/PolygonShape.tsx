import { Line } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";
import { usePattern } from "../patterns/usePattern";
import { getShadowProps } from "../patterns/shadowConfig";

interface Props {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  hovered?: boolean;
  onSelect: () => void;
}

export function PolygonShape({ obj, scale, offsetX, offsetY, selected, hovered, onSelect }: Props) {
  const pxScale = PIXELS_PER_FOOT * scale;
  const pattern = usePattern(obj.type);
  const shadow = getShadowProps(obj.type);

  const flatPoints = obj.points.flatMap((p) => [
    (p[0] + obj.position.x) * pxScale + offsetX,
    (p[1] + obj.position.y) * pxScale + offsetY,
  ]);

  const patternScale = 1 / scale;

  const hoverGlow = hovered ? {
    shadowColor: '#4a9eff',
    shadowBlur: 8,
    shadowOpacity: 0.3,
    shadowEnabled: true,
  } : {};

  return (
    <Line
      points={flatPoints}
      closed
      fill={!pattern ? (obj.style.fill ?? "#888") : undefined}
      fillPatternImage={pattern ?? undefined}
      fillPatternRepeat="repeat"
      fillPatternScaleX={patternScale}
      fillPatternScaleY={patternScale}
      stroke={selected ? "#fff" : (obj.style.stroke ?? "#666")}
      strokeWidth={(obj.style.strokeWidth ?? 2) * (selected ? 1.5 : 1)}
      dash={obj.style.dash}
      opacity={obj.style.opacity ?? 0.8}
      {...(hovered ? hoverGlow : shadow)}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
