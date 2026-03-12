import { useEffect } from "react";
import { useLandscapeStore } from "./store/landscapeStore";
import { ProjectSetupModal } from "./ui/ProjectSetupModal";
import { PlanView } from "./plan/PlanView";
import { HUD } from "./ui/HUD";

export function App() {
  const project = useLandscapeStore((s) => s.project);
  const undo = useLandscapeStore((s) => s.undo);
  const redo = useLandscapeStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
