import { useLandscapeStore } from "../../store/landscapeStore";
import { BoundaryShape } from "../shapes/BoundaryShape";
import { HouseShape } from "../shapes/HouseShape";

interface Props {
  scale: number;
  offsetX: number;
  offsetY: number;
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
      {sorted.map((obj) => {
        const props = {
          key: obj.id,
          obj,
          scale,
          offsetX,
          offsetY,
          selected: obj.id === selectedId,
          onSelect: () => selectObject(obj.id),
        };

        switch (obj.type) {
          case "boundary":
            return <BoundaryShape {...props} />;
          case "house":
            return <HouseShape {...props} />;
          default:
            return null;
        }
      })}
    </>
  );
}
