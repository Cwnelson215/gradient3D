import { useEffect } from "react";
import { useLandscapeStore } from "./store/landscapeStore";
import { ProjectSetupModal } from "./ui/ProjectSetupModal";
import { PlanView } from "./plan/PlanView";
import { HUD } from "./ui/HUD";

export function App() {
  const project = useLandscapeStore((s) => s.project);
  const undo = useLandscapeStore((s) => s.undo);
  const redo = useLandscapeStore((s) => s.redo);
  const removeObject = useLandscapeStore((s) => s.removeObject);
  const copyObject = useLandscapeStore((s) => s.copyObject);
  const pasteObject = useLandscapeStore((s) => s.pasteObject);
  const duplicateObject = useLandscapeStore((s) => s.duplicateObject);
  const selectObject = useLandscapeStore((s) => s.selectObject);
  const setActiveTool = useLandscapeStore((s) => s.setActiveTool);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (isInput) return;
        const selectedId = useLandscapeStore.getState().selectedObjectId;
        if (selectedId) {
          e.preventDefault();
          removeObject(selectedId);
        }
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (isInput) return;
        const selectedId = useLandscapeStore.getState().selectedObjectId;
        if (selectedId) {
          e.preventDefault();
          copyObject(selectedId);
        }
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (isInput) return;
        e.preventDefault();
        pasteObject();
      }
      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        if (isInput) return;
        const selectedId = useLandscapeStore.getState().selectedObjectId;
        if (selectedId) {
          e.preventDefault();
          duplicateObject(selectedId);
        }
      }
      // Escape deselect
      if (e.key === "Escape") {
        selectObject(null);
        setActiveTool("select");
      }
      // Tool shortcuts (1/2/3)
      if (!isInput && !e.ctrlKey && !e.metaKey) {
        if (e.key === "1") setActiveTool("select");
        if (e.key === "2") setActiveTool("pan");
        if (e.key === "3") setActiveTool("measure");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, removeObject, copyObject, pasteObject, duplicateObject, selectObject, setActiveTool]);

  if (!project) {
    return <ProjectSetupModal />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <PlanView />
      <HUD />
    </div>
  );
}
