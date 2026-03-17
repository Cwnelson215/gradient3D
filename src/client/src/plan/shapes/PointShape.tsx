import { Circle } from "react-konva";
import type { LandscapeObject } from "../../types/landscape";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";
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

export function PointShape({ obj, scale, offsetX, offsetY, selected, hovered, onSelect }: Props) {
  if (obj.points.length === 0) return null;

  const pxScale = PIXELS_PER_FOOT * scale;
  const cx = (obj.points[0][0] + obj.position.x) * pxScale + offsetX;
  const cy = (obj.points[0][1] + obj.position.y) * pxScale + offsetY;
  const r = (obj.radius ?? (obj.properties.radius as number) ?? 3) * pxScale;
  const shadow = getShadowProps(obj.type);

  const isTree = obj.type === "tree";
  const isShrub = obj.type === "shrub";

  const hoverGlow = hovered ? {
    shadowColor: '#4a9eff',
    shadowBlur: 8,
    shadowOpacity: 0.3,
    shadowEnabled: true,
  } : {};

  const gradientProps =
    isTree || isShrub
      ? {
          fillRadialGradientStartPoint: { x: 0, y: 0 },
          fillRadialGradientEndPoint: { x: 0, y: 0 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndRadius: r,
          fillRadialGradientColorStops: isTree
            ? [0, "#2d5a1e", 0.5, "#3a7d2c", 0.85, "#6aaf4a", 1, "rgba(106,175,74,0.2)"]
            : [0, "#2d6a1e", 0.5, "#4a8c3a", 0.85, "#7ab85a", 1, "rgba(122,184,90,0.2)"],
        }
      : {};

  return (
    <>
      <Circle
        x={cx}
        y={cy}
        radius={r}
        fill={isTree || isShrub ? undefined : (obj.style.fill ?? "#3a7d2c")}
        {...gradientProps}
        stroke={selected ? "#fff" : (obj.style.stroke ?? "#2d5a1e")}
        strokeWidth={(obj.style.strokeWidth ?? 1) * (selected ? 2 : 1)}
        opacity={obj.style.opacity ?? 0.8}
        {...(hovered ? hoverGlow : shadow)}
        onClick={onSelect}
        onTap={onSelect}
      />
      {selected && (
        <Circle
          x={cx}
          y={cy}
          radius={3}
          fill="#fff"
        />
      )}
    </>
  );
}
