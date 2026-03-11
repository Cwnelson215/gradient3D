import { useLandscapeStore } from "../../store/landscapeStore";
import { BoundaryShape } from "../shapes/BoundaryShape";
import { HouseShape } from "../shapes/HouseShape";
import { PolygonShape } from "../shapes/PolygonShape";
import { LineShape } from "../shapes/LineShape";
import { PointShape } from "../shapes/PointShape";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  scale: number;
  offsetX: number;
  offsetY: number;
}

function ShapeForObject({
  obj,
  scale,
  offsetX,
  offsetY,
  selected,
  onSelect,
}: {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const shapeProps = { obj, scale, offsetX, offsetY, selected, onSelect };

  // Special renderers for boundary and house (legacy look)
  if (obj.type === "boundary") return <BoundaryShape {...shapeProps} />;
  if (obj.type === "house") return <HouseShape {...shapeProps} />;

  // Generic renderers by geometry mode
  switch (obj.geometry) {
    case "polygon":
      return <PolygonShape {...shapeProps} />;
    case "line":
      return <LineShape {...shapeProps} />;
    case "point":
      return <PointShape {...shapeProps} />;
    default:
      return null;
  }
}

export function ObjectLayer({ scale, offsetX, offsetY }: Props) {
  const objects = useLandscapeStore((s) => s.project?.objects ?? []);
  const selectedId = useLandscapeStore((s) => s.selectedObjectId);
  const selectObject = useLandscapeStore((s) => s.selectObject);

  const sorted = [...objects]
    .filter((o) => o.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sorted.map((obj) => (
        <ShapeForObject
          key={obj.id}
          obj={obj}
          scale={scale}
          offsetX={offsetX}
          offsetY={offsetY}
          selected={obj.id === selectedId}
          onSelect={() => selectObject(obj.id)}
        />
      ))}
    </>
  );
}
