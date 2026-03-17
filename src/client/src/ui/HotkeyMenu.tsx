import { useState } from "react";
import { colors, font, spacing, radius, shadow, panelStyle, zIndex } from "./theme";
import { HelpCircleIcon, XIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export function HotkeyButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Tooltip content="Keyboard Shortcuts" shortcut="?">
      <button onClick={onToggle} style={triggerBtn}>
        <HelpCircleIcon size={15} />
      </button>
    </Tooltip>
  );
}

export function HotkeyPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
          <span style={{ color: colors.text, fontWeight: font.weight.semibold, fontSize: font.size.lg, fontFamily: font.family }}>
            Keyboard Shortcuts
          </span>
          <button onClick={onClose} style={closeBtn}>
            <XIcon size={14} />
          </button>
        </div>

        <div style={sectionTitle}>Tools</div>
        <Row keys={["1"]} desc="Select" />
        <Row keys={["2"]} desc="Pan" />
        <Row keys={["3"]} desc="Measure" />

        <div style={{ ...sectionTitle, marginTop: spacing.lg }}>Actions</div>
        <Row keys={["Ctrl", "Z"]} desc="Undo" />
        <Row keys={["Ctrl", "Shift", "Z"]} desc="Redo" />
        <Row keys={["Del"]} desc="Delete selected" />
        <Row keys={["Esc"]} desc="Cancel / deselect" />
        <Row keys={["Enter"]} desc="Finish line drawing" />
        <Row keys={["Ctrl", "C"]} desc="Copy object" />
        <Row keys={["Ctrl", "V"]} desc="Paste object" />
        <Row keys={["Ctrl", "D"]} desc="Duplicate object" />

        <div style={{ ...sectionTitle, marginTop: spacing.lg }}>Mouse</div>
        <Row keys={["Scroll"]} desc="Zoom in/out" />
        <Row keys={["Click"]} desc="Select object" />
        <Row keys={["Middle"]} desc="Pan view" />
      </div>
    </div>
  );
}

function Row({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: spacing.xl, padding: `${spacing.xs + 1}px 0` }}>
      <div style={{ display: "flex", gap: 3 }}>
        {keys.map((k, i) => (
          <kbd key={i} style={kbd}>{k}</kbd>
        ))}
      </div>
      <span style={{ color: colors.textMuted, fontSize: font.size.sm, fontFamily: font.family }}>{desc}</span>
    </div>
  );
}

const triggerBtn: React.CSSProperties = {
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

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: zIndex.modal,
  pointerEvents: "auto",
  backdropFilter: "blur(2px)",
};

const panel: React.CSSProperties = {
  ...panelStyle(),
  background: colors.surfaceFloating,
  padding: spacing.xxl,
  width: 360,
  maxHeight: "80vh",
  overflowY: "auto",
};

const closeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: colors.textMuted,
  padding: 4,
  display: "flex",
  borderRadius: 4,
};

const sectionTitle: React.CSSProperties = {
  color: colors.textMuted,
  fontWeight: font.weight.semibold,
  fontSize: font.size.xs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: spacing.xs,
  fontFamily: font.family,
};

const kbd: React.CSSProperties = {
  background: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  padding: "2px 7px",
  fontSize: font.size.xs,
  fontFamily: font.family,
  color: colors.text,
  lineHeight: "16px",
  minWidth: 20,
  textAlign: "center",
};
