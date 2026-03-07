import { useLandscapeStore } from "./store/landscapeStore";
import { ProjectSetupModal } from "./ui/ProjectSetupModal";
import { SceneView } from "./scene/SceneView";
import { PlanView } from "./plan/PlanView";
import { HUD } from "./ui/HUD";

export function App() {
  const project = useLandscapeStore((s) => s.project);
  const viewMode = useLandscapeStore((s) => s.viewMode);

  if (!project) {
    return <ProjectSetupModal />;
  }

  const showPlan = viewMode === "plan" || viewMode === "split";
  const show3D = viewMode === "view3d" || viewMode === "split";

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", position: "relative" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: viewMode === "split" ? "row" : undefined,
        }}
      >
        {showPlan && (
          <div
            style={{
              width: viewMode === "split" ? "50%" : "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <PlanView />
          </div>
        )}
        {show3D && (
          <div
            style={{
              width: viewMode === "split" ? "50%" : "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <SceneView />
          </div>
        )}
      </div>
      <HUD />
    </div>
  );
}
