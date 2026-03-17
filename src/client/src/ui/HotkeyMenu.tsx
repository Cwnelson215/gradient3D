import { useState } from "react";
import { colors, font, spacing, radius, shadow, panelStyle, transition } from "./theme";

export function HotkeyMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div style={container}>
      {open && (
        <div style={panel}>
          <div style={sectionTitle}>Keyboard Shortcuts</div>
          <Row keys="Ctrl+Z" desc="Undo" />
          <Row keys="Ctrl+Shift+Z" desc="Redo" />
          <Row keys="Delete" desc="Delete selected" />
          <Row keys="Escape" desc="Cancel / deselect" />
          <Row keys="Enter" desc="Finish line drawing" />
          <Row keys="Ctrl+C" desc="Copy object" />
          <Row keys="Ctrl+V" desc="Paste object" />
          <Row keys="Ctrl+D" desc="Duplicate object" />
          <Row keys="1 / 2 / 3" desc="Select / Pan / Measure" />

          <div style={{ ...sectionTitle, marginTop: spacing.md }}>Mouse Controls</div>
          <Row keys="Scroll" desc="Zoom in/out" />
          <Row keys="Click" desc="Select object" />
          <Row keys="Middle drag" desc="Pan view" />
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={btn} title="Keyboard shortcuts">
        ?
      </button>
    </div>
  );
}

function Row({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.xl }}>
      <span style={{ color: colors.text, whiteSpace: "nowrap", fontSize: font.size.xs }}>{keys}</span>
      <span style={{ color: colors.textMuted, fontSize: font.size.xs }}>{desc}</span>
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  bottom: 36,
  right: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: spacing.sm,
  zIndex: 100,
  pointerEvents: "auto",
};

const panel: React.CSSProperties = {
  ...panelStyle(),
  padding: `${spacing.md}px ${spacing.lg}px`,
  fontSize: font.size.sm,
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
  whiteSpace: "nowrap",
};

const sectionTitle: React.CSSProperties = {
  color: colors.text,
  fontWeight: font.weight.semibold,
  fontSize: font.size.xs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: spacing.xs,
  fontFamily: font.family,
};

const btn: React.CSSProperties = {
  padding: `${spacing.sm + 2}px ${spacing.md + 2}px`,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.semibold,
  background: colors.surface,
  color: colors.textMuted,
  transition,
  width: 28,
  textAlign: "center",
};
