import { useMemo } from "react";
import type { ObjectType } from "../../types/landscape";
import { getPattern } from "./patternGenerator";

export function usePattern(objectType: ObjectType): HTMLCanvasElement | null {
  return useMemo(() => getPattern(objectType), [objectType]);
}
