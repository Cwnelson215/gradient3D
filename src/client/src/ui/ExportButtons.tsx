export function ExportButtons() {
  const handleExport2D = () => {
    const stage = document.querySelector(".konvajs-content canvas") as HTMLCanvasElement;
    if (!stage) return;
    const url = stage.toDataURL();
    const a = document.createElement("a");
    a.href = url;
    a.download = "landscape-2d.png";
    a.click();
  };

  const handleExport3D = () => {
    const canvas = document.querySelector("canvas[data-engine]") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "landscape-3d.png";
    a.click();
  };

  return (
    <div style={container}>
      <button onClick={handleExport2D} style={btn} title="Export 2D view as PNG">
        2D PNG
      </button>
      <button onClick={handleExport3D} style={btn} title="Export 3D view as PNG">
        3D PNG
      </button>
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  left: 8,
  display: "flex",
  gap: 4,
  zIndex: 100,
  pointerEvents: "auto",
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 11,
  background: "#222",
  color: "#999",
};
