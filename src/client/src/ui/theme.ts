import type React from "react";

export const colors = {
  bg: "#0f0f14",
  surface: "#1a1a24",
  surfaceFloating: "#1e1e2e",
  surfaceHover: "#222233",
  border: "#2a2a3a",
  borderFocus: "#4a9eff",
  text: "#e0e0e8",
  textMuted: "#8888a0",
  accent: "#4a9eff",
  accentHover: "#3a8eef",
  accentSubtle: "rgba(74, 158, 255, 0.15)",
  danger: "#e04040",
  dangerHover: "#c03030",
  success: "#34d399",
  warning: "#fbbf24",
};

export const zIndex = {
  hud: 100,
  dropdown: 200,
  modal: 1000,
  toast: 1100,
};

export const font = {
  family: "'Inter', system-ui, -apple-system, sans-serif",
  size: {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 13,
    xl: 14,
  },
  weight: {
    normal: 400 as const,
    medium: 500 as const,
    semibold: 600 as const,
  },
};

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};

export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.3)",
  md: "0 4px 12px rgba(0,0,0,0.4)",
  lg: "0 8px 24px rgba(0,0,0,0.5)",
};

export const transition = "all 0.15s ease";

export function panelStyle(): React.CSSProperties {
  return {
    background: colors.surface,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    boxShadow: shadow.md,
    fontFamily: font.family,
  };
}

export function overlayStyle(): React.CSSProperties {
  return {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: zIndex.modal,
    pointerEvents: "auto",
    backdropFilter: "blur(4px)",
  };
}

export function modalStyle(width: number): React.CSSProperties {
  return {
    ...panelStyle(),
    background: colors.surfaceFloating,
    padding: spacing.xxl,
    width,
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
  };
}

export function fieldLabelStyle(): React.CSSProperties {
  return {
    display: "block",
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontFamily: font.family,
    fontWeight: font.weight.medium,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };
}

export function buttonStyle(
  variant: "default" | "primary" | "danger" | "ghost" = "default"
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: `${spacing.sm + 2}px ${spacing.lg}px`,
    border: "none",
    borderRadius: radius.sm,
    cursor: "pointer",
    fontFamily: font.family,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    transition,
    lineHeight: 1,
  };

  switch (variant) {
    case "primary":
      return { ...base, background: colors.accent, color: "#fff" };
    case "danger":
      return { ...base, background: colors.danger, color: "#fff" };
    case "ghost":
      return { ...base, background: "transparent", color: colors.textMuted };
    default:
      return { ...base, background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` };
  }
}

export function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: `${spacing.sm + 2}px ${spacing.md}px`,
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: font.size.md,
    fontFamily: font.family,
    boxSizing: "border-box" as const,
    transition,
    outline: "none",
  };
}
