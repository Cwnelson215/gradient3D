import { Text, Rect, Group } from "react-konva";
import { PIXELS_PER_FOOT } from "../../utils/coordinates";
import type { LandscapeObject } from "../../types/landscape";

interface Props {
  obj: LandscapeObject;
  scale: number;
  offsetX: number;
  offsetY: number;
  selected: boolean;
  onSelect: () => void;
}

export function AnnotationShape({ obj, scale, offsetX, offsetY, selected, onSelect }: Props) {
  if (obj.points.length === 0) return null;

  const pxScale = PIXELS_PER_FOOT * scale;
  const cx = (obj.points[0][0] + obj.position.x) * pxScale + offsetX;
  const cy = (obj.points[0][1] + obj.position.y) * pxScale + offsetY;
  const text = (obj.properties.text as string) ?? "Note";
  const fontSize = Math.max(10, 13 * Math.min(scale, 2));

  return (
    <Group x={cx} y={cy} onClick={onSelect}>
      {selected && (
        <Rect
          x={-4}
          y={-4}
          width={text.length * fontSize * 0.6 + 16}
          height={fontSize + 12}
          fill="rgba(74, 158, 255, 0.1)"
          stroke="#4a9eff"
          strokeWidth={1}
          dash={[4, 2]}
          cornerRadius={4}
        />
      )}
      <Text
        x={0}
        y={0}
        text={text}
        fill="rgba(255,255,255,0.9)"
        fontSize={fontSize}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        shadowColor="rgba(0,0,0,0.8)"
        shadowBlur={3}
        shadowOffsetX={1}
        shadowOffsetY={1}
      />
    </Group>
  );
}
