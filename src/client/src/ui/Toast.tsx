import { useEffect, useState, useCallback } from "react";
import { create } from "zustand";
import { colors, font, spacing, radius, shadow, zIndex } from "./theme";

type ToastType = "info" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  nextId: number;
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  nextId: 0,
  showToast: (message, type = "info") => {
    const id = get().nextId;
    set((s) => ({
      toasts: [...s.toasts, { id, message, type }],
      nextId: s.nextId + 1,
    }));
    setTimeout(() => get().removeToast(id), 3000);
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => setEntering(false));
  }, []);

  const borderColor =
    toast.type === "success" ? colors.success :
    toast.type === "error" ? colors.danger :
    colors.accent;

  return (
    <div
      style={{
        background: colors.surfaceFloating,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: radius.md,
        padding: `${spacing.md}px ${spacing.xl}px`,
        boxShadow: shadow.lg,
        color: colors.text,
        fontSize: font.size.sm,
        fontFamily: font.family,
        transition: "all 0.3s ease",
        transform: entering ? "translateY(16px)" : "translateY(0)",
        opacity: entering ? 0 : 1,
        cursor: "pointer",
      }}
      onClick={onRemove}
    >
      {toast.message}
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const removeToast = useToast((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 44,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: zIndex.toast,
        display: "flex",
        flexDirection: "column",
        gap: spacing.sm,
        pointerEvents: "auto",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
