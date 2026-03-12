import type { ObjectType } from "../../types/landscape";

const cache = new Map<string, HTMLCanvasElement>();

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function lawnPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#5a8a4a";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(42);
  for (let i = 0; i < 300; i++) {
    const x = rng() * 64;
    const y = rng() * 64;
    const g = 100 + rng() * 80;
    ctx.fillStyle = `rgba(${40 + rng() * 30}, ${g}, ${30 + rng() * 20}, 0.6)`;
    ctx.fillRect(x, y, 1, 1);
  }
  // Grass stroke stipples
  for (let i = 0; i < 80; i++) {
    const x = rng() * 64;
    const y = rng() * 64;
    ctx.strokeStyle = `rgba(${50 + rng() * 40}, ${120 + rng() * 60}, ${30 + rng() * 20}, 0.5)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 2, y - 2 - rng() * 3);
    ctx.stroke();
  }
  return c;
}

function pathwayPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#a09080";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(10);
  // Flagstone rectangles with mortar gaps
  const stones = [
    [2, 2, 28, 28],
    [34, 2, 28, 12],
    [34, 18, 28, 12],
    [2, 34, 12, 28],
    [18, 34, 20, 28],
    [42, 34, 20, 28],
  ];
  for (const [sx, sy, sw, sh] of stones) {
    const v = rng() * 30 - 15;
    ctx.fillStyle = `rgb(${180 + v}, ${170 + v}, ${155 + v})`;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, sy, sw, sh);
  }
  return c;
}

function patioPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  const rng = seededRandom(44);
  ctx.fillStyle = "#888";
  ctx.fillRect(0, 0, 64, 64);
  // Brick pattern
  const bw = 28, bh = 12, gap = 2;
  for (let row = 0; row < 5; row++) {
    const offset = row % 2 === 0 ? 0 : bw / 2 + gap / 2;
    for (let col = -1; col < 3; col++) {
      const x = col * (bw + gap) + offset;
      const y = row * (bh + gap);
      const v = rng() * 20 - 10;
      ctx.fillStyle = `rgb(${190 + v}, ${170 + v}, ${135 + v})`;
      ctx.fillRect(x, y, bw, bh);
    }
  }
  return c;
}

function drivewayPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#b5b5b5";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(20);
  // Concrete speckle
  for (let i = 0; i < 200; i++) {
    const v = 150 + rng() * 70;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rng() * 64, rng() * 64, 1 + rng() * 2, 1 + rng() * 2);
  }
  return c;
}

function waterPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#3a7aaa";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(101);
  // Wavy horizontal lines
  for (let y = 4; y < 64; y += 8) {
    ctx.strokeStyle = `rgba(80, 160, 220, ${0.3 + rng() * 0.3})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= 64; x += 4) {
      const dy = Math.sin((x + rng() * 10) * 0.3) * 2;
      if (x === 0) ctx.moveTo(x, y + dy);
      else ctx.lineTo(x, y + dy);
    }
    ctx.stroke();
  }
  // Light sparkle dots
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(200, 230, 255, ${0.2 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.arc(rng() * 64, rng() * 64, 0.5 + rng(), 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function gardenPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#7a5930";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(88);
  // Soil speckles
  for (let i = 0; i < 300; i++) {
    const v = rng() * 40 - 20;
    ctx.fillStyle = `rgb(${110 + v}, ${75 + v * 0.8}, ${45 + v * 0.5})`;
    ctx.fillRect(rng() * 64, rng() * 64, 1 + rng() * 2, 1 + rng() * 2);
  }
  // Small pebbles
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = `rgba(180, 160, 130, ${0.3 + rng() * 0.3})`;
    ctx.beginPath();
    ctx.arc(rng() * 64, rng() * 64, 1 + rng() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function flowerBedPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#5c3a1e";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(111);
  // Mulch base
  for (let i = 0; i < 120; i++) {
    const x = rng() * 64;
    const y = rng() * 64;
    const angle = rng() * Math.PI;
    const len = 3 + rng() * 6;
    const w = 1 + rng() * 2;
    const v = rng() * 30 - 15;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgb(${85 + v}, ${55 + v * 0.7}, ${30 + v * 0.4})`;
    ctx.fillRect(-len / 2, -w / 2, len, w);
    ctx.restore();
  }
  // Colorful flower dots
  const colors = ["#ff6b8a", "#ffb347", "#fff44f", "#87ceeb", "#dda0dd", "#ff4500"];
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
    ctx.beginPath();
    ctx.arc(rng() * 64, rng() * 64, 1.5 + rng() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function housePattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#c0b0a0";
  ctx.fillRect(0, 0, 64, 64);
  // Diagonal hatching
  ctx.strokeStyle = "rgba(100, 90, 80, 0.3)";
  ctx.lineWidth = 0.8;
  for (let i = -64; i < 128; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 64, 64);
    ctx.stroke();
  }
  return c;
}

function poolPattern(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = "#5a9ac0";
  ctx.fillRect(0, 0, 64, 64);
  const rng = seededRandom(102);
  // Wavy lines with brighter blue
  for (let y = 6; y < 64; y += 10) {
    ctx.strokeStyle = `rgba(100, 180, 240, ${0.3 + rng() * 0.2})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= 64; x += 4) {
      const dy = Math.sin((x + rng() * 8) * 0.25) * 2;
      if (x === 0) ctx.moveTo(x, y + dy);
      else ctx.lineTo(x, y + dy);
    }
    ctx.stroke();
  }
  return c;
}

const patternMap: Partial<Record<ObjectType, () => HTMLCanvasElement>> = {
  lawn: lawnPattern,
  pathway: pathwayPattern,
  patio: patioPattern,
  driveway: drivewayPattern,
  pond: waterPattern,
  pool: poolPattern,
  garden: gardenPattern,
  "flower-bed": flowerBedPattern,
  house: housePattern,
};

export function getPattern(objectType: ObjectType): HTMLCanvasElement | null {
  const factory = patternMap[objectType];
  if (!factory) return null;
  if (cache.has(objectType)) return cache.get(objectType)!;
  const canvas = factory();
  cache.set(objectType, canvas);
  return canvas;
}
