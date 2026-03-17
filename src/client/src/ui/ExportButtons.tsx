import { DownloadIcon } from "./icons";
import { Tooltip } from "./Tooltip";

interface Props {
  onExportClick: () => void;
}

export function ExportButton({ onExportClick }: Props) {
  return (
    <Tooltip content="Export as PNG">
      <button onClick={onExportClick} style={iconBtn}>
        <DownloadIcon size={15} />
      </button>
    </Tooltip>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 6,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#8888a0",
  transition: "all 0.15s ease",
};
