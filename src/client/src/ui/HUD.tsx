import { useLandscapeStore } from "../store/landscapeStore";
import { Toolbar } from "./Toolbar";
import { ModeSelector } from "./ModeSelector";
import { ParameterPanel } from "./ParameterPanel";
import { ViewModeToggle } from "./ViewModeToggle";
import { PlanToolbar } from "./PlanToolbar";
import { ObjectProperties } from "./ObjectProperties";

export function HUD() {
  const viewMode = useLandscapeStore((s) => s.viewMode);
  const showPlan = viewMode === "plan" || viewMode === "split";
  const show3D = viewMode === "view3d" || viewMode === "split";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <ViewModeToggle />
      {showPlan && <PlanToolbar />}
      {showPlan && <ObjectProperties />}
      {show3D && <Toolbar />}
      {show3D && <ModeSelector />}
      {show3D && <ParameterPanel />}
    </div>
  );
}
