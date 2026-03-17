import type { LandscapeObject, PropertyConfig } from "../../types/landscape";

export async function exportGlb(
  objects: LandscapeObject[],
  property: PropertyConfig,
  filename: string
): Promise<void> {
  const { buildScene } = await import("./buildScene");
  const { GLTFExporter } = await import(
    "three/examples/jsm/exporters/GLTFExporter.js"
  );

  const scene = buildScene(objects, property);
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], {
          type: "model/gltf-binary",
        });
        downloadBlob(blob, `${filename}.glb`);
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
