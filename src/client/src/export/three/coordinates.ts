import * as THREE from "three";

/**
 * Convert app 2D points to a THREE.Shape.
 * App: X right, Y down (feet). Three.js: X right, Z forward, Y up.
 * For extruded shapes we build a Shape in XZ, then position in 3D.
 */
export function polygonToShape(
  points: [number, number][],
  offsetX: number,
  offsetY: number
): THREE.Shape {
  const pts = points.map(
    ([x, y]) => new THREE.Vector2(x + offsetX, -(y + offsetY))
  );

  // Ensure CCW winding (THREE.Shape expects CCW)
  if (signedArea(pts) < 0) pts.reverse();

  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i].x, pts[i].y);
  }
  shape.closePath();
  return shape;
}

/** Signed area — positive = CCW, negative = CW */
function signedArea(pts: THREE.Vector2[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return area / 2;
}

/** Convert app (x, y) to Three.js (x, 0, -y) */
export function toVec3(x: number, y: number, height = 0): THREE.Vector3 {
  return new THREE.Vector3(x, height, -y);
}
