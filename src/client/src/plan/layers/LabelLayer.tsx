import { Text } from "react-konva";
import { useLandscapeStore } from "../../store/landscapeStore";
import { PIXELS_PER_FOOT, polygonArea, polygonCentroid } from "../../utils/coordinates";
import { polylineLength } from "../../utils/coordinates";

interface Props {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function LabelLayer({ scale, offsetX, offsetY }: Props) {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const pxScale = PIXELS_PER_FOOT * scale;

  return (
    <>
      {objects
        .filter((o) => o.visible)
        .map((obj) => {
          let labelText = "";
          let cx = 0;
          let cy = 0;

          if (obj.geometry === "polygon" && obj.points.length >= 3) {
            const area = polygonArea(obj.points);
            labelText = `${area.toFixed(0)} sq ft`;
            const centroid = polygonCentroid(obj.points);
            cx = (centroid[0] + obj.position.x) * pxScale + offsetX;
            cy = (centroid[1] + obj.position.y) * pxScale + offsetY;
          } else if (obj.geometry === "line" && obj.points.length >= 2) {
            const len = polylineLength(obj.points);
            labelText = `${len.toFixed(1)} ft`;
            // Place label at midpoint of first segment
            const mid = Math.floor(obj.points.length / 2);
            cx = ((obj.points[mid][0] + obj.position.x) * pxScale + offsetX);
            cy = ((obj.points[mid][1] + obj.position.y) * pxScale + offsetY) - 12;
          } else if (obj.geometry === "point" && obj.points.length > 0) {
            const r = obj.radius ?? (obj.properties.radius as number) ?? 3;
            labelText = `${(r * 2).toFixed(0)} ft`;
            cx = (obj.points[0][0] + obj.position.x) * pxScale + offsetX;
            cy = (obj.points[0][1] + obj.position.y) * pxScale + offsetY + r * pxScale + 4;
          }

          if (!labelText) return null;

          return (
            <Text
              key={obj.id}
              x={cx}
              y={cy}
              text={labelText}
              fill="rgba(255,255,255,0.7)"
              fontSize={10}
              fontFamily="Inter, sans-serif"
              offsetX={labelText.length * 3}
            />
          );
        })}
    </>
  );
}
