import { useState, useRef, useCallback } from "react";
import { colors, font, spacing, radius, shadow, zIndex } from "./theme";

interface Props {
  content: string;
  shortcut?: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
}

export function Tooltip({ content, shortcut, position = "bottom", children }: Props) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 200);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  const posStyles: React.CSSProperties =
    position === "top"
      ? { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 6 }
      : position === "left"
        ? { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: 6 }
        : position === "right"
          ? { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 6 }
          : { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 6 };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            ...posStyles,
            background: colors.surfaceFloating,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.sm,
            padding: `${spacing.sm}px ${spacing.md}px`,
            boxShadow: shadow.md,
            zIndex: zIndex.dropdown,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
          }}
        >
          <span style={{ color: colors.text, fontSize: font.size.xs, fontFamily: font.family }}>
            {content}
          </span>
          {shortcut && (
            <kbd
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                padding: "1px 5px",
                fontSize: font.size.xs - 1,
                fontFamily: font.family,
                color: colors.textMuted,
                lineHeight: "14px",
              }}
            >
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}
