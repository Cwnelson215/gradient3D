import { colors, font, spacing, radius, transition } from "./theme";
import { DownloadIcon } from "./icons";

interface Props {
  onExportClick: () => void;
}

export function ExportButtons({ onExportClick }: Props) {
  return (
    <div style={container}>
      <button onClick={onExportClick} style={btn} title="Export plan as image">
        <DownloadIcon size={13} />
        Export
      </button>
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  display: "flex",
  gap: spacing.sm,
  zIndex: 100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: `${spacing.sm + 2}px ${spacing.lg}px`,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  background: colors.surface,
  color: colors.textMuted,
  display: "flex",
  alignItems: "center",
  gap: spacing.sm + 1,
  transition,
  lineHeight: 1,
};
