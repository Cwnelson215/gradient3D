import { useLandscapeStore } from "../store/landscapeStore";
import { ModeSelector } from "./ModeSelector";
import { ViewModeToggle } from "./ViewModeToggle";
import { PlanToolbar } from "./PlanToolbar";
import { ObjectProperties } from "./ObjectProperties";

export function HUD() {
  const viewMode = useLandscapeStore((s) => s.viewMode);
  const showPlan = viewMode === "plan" || viewMode === "split";
  const show3D = viewMode === "view3d" || viewMode === "split";
  const isSplit = viewMode === "split";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: isSplit ? "flex" : undefined,
      }}
    >
      <ViewModeToggle />
      {isSplit ? (
        <>
          {/* Plan half */}
          <div style={{ position: "relative", width: "50%", height: "100%", pointerEvents: "none" }}>
            <PlanToolbar />
            <ObjectProperties />
          </div>
          {/* 3D half */}
          <div style={{ position: "relative", width: "50%", height: "100%", pointerEvents: "none" }}>
            <ModeSelector />
          </div>
        </>
      ) : (
        <>
          {showPlan && <PlanToolbar />}
          {showPlan && <ObjectProperties />}
          {show3D && <ModeSelector />}
        </>
      )}
    </div>
  );
}
