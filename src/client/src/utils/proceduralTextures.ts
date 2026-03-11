import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

function getCached(key: string, create: () => THREE.CanvasTexture): THREE.CanvasTexture {
  if (textureCache.has(key)) return textureCache.get(key)!;
  const tex = create();
  textureCache.set(key, tex);
  return tex;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function wrapTexture(canvas: HTMLCanvasElement, repeatX = 4, repeatY = 4): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

// Seeded random for deterministic results
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function createGrassTexture() {
  return {
    map: getCached("grass_map", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#4a7c3f";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(42);
      for (let i = 0; i < 3000; i++) {
        const x = rng() * 256;
        const y = rng() * 256;
        const g = 60 + rng() * 40;
        ctx.strokeStyle = `rgb(${30 + rng() * 30}, ${g + 40}, ${20 + rng() * 20})`;
        ctx.lineWidth = 0.5 + rng() * 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rng() - 0.5) * 3, y - 3 - rng() * 6);
        ctx.stroke();
      }
      return wrapTexture(c, 8, 8);
    }),
    normalMap: getCached("grass_normal", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(99);
      for (let i = 0; i < 2000; i++) {
        const x = rng() * 256;
        const y = rng() * 256;
        ctx.fillStyle = `rgb(${120 + rng() * 20}, ${120 + rng() * 20}, ${200 + rng() * 55})`;
        ctx.fillRect(x, y, 1, 3 + rng() * 4);
      }
      return wrapTexture(c, 8, 8);
    }),
    roughnessMap: getCached("grass_rough", () => {
      const [c, ctx] = makeCanvas(128, 128);
      ctx.fillStyle = "#d9d9d9";
      ctx.fillRect(0, 0, 128, 128);
      const rng = seededRandom(77);
      for (let i = 0; i < 500; i++) {
        const v = 180 + rng() * 60;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(rng() * 128, rng() * 128, 2 + rng() * 4, 2 + rng() * 4);
      }
      return wrapTexture(c, 8, 8);
    }),
  };
}

export function createBarkTexture() {
  return {
    map: getCached("bark_map", () => {
      const [c, ctx] = makeCanvas(128, 256);
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(0, 0, 128, 256);
      const rng = seededRandom(31);
      for (let y = 0; y < 256; y += 2) {
        for (let x = 0; x < 128; x += 2) {
          const v = rng() * 40 - 20;
          ctx.fillStyle = `rgb(${90 + v}, ${58 + v}, ${26 + v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
      for (let i = 0; i < 30; i++) {
        const x = rng() * 128;
        ctx.strokeStyle = `rgba(40, 25, 10, ${0.3 + rng() * 0.4})`;
        ctx.lineWidth = 1 + rng() * 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (rng() - 0.5) * 20, 256);
        ctx.stroke();
      }
      return wrapTexture(c, 1, 1);
    }),
    normalMap: getCached("bark_normal", () => {
      const [c, ctx] = makeCanvas(128, 256);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 128, 256);
      const rng = seededRandom(55);
      for (let i = 0; i < 20; i++) {
        const x = rng() * 128;
        ctx.strokeStyle = `rgb(${100 + rng() * 40}, ${100 + rng() * 40}, 255)`;
        ctx.lineWidth = 2 + rng() * 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (rng() - 0.5) * 15, 256);
        ctx.stroke();
      }
      return wrapTexture(c, 1, 1);
    }),
  };
}

export function createStoneTexture(type: "flagstone" | "concrete" | "gravel" = "flagstone") {
  const key = `stone_${type}`;
  return {
    map: getCached(`${key}_map`, () => {
      const [c, ctx] = makeCanvas(256, 256);
      const rng = seededRandom(type === "flagstone" ? 10 : type === "concrete" ? 20 : 30);

      if (type === "flagstone") {
        ctx.fillStyle = "#b0a090";
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 12; i++) {
          const x = (i % 4) * 64 + rng() * 10;
          const y = Math.floor(i / 4) * 85 + rng() * 10;
          const r = 100 + rng() * 60;
          ctx.fillStyle = `rgb(${r + 30}, ${r + 20}, ${r})`;
          ctx.strokeStyle = "#706050";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(x + 2, y + 2, 56 + rng() * 8, 76 + rng() * 8);
          ctx.fill();
          ctx.stroke();
        }
      } else if (type === "concrete") {
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1000; i++) {
          const v = 160 + rng() * 60;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(rng() * 256, rng() * 256, 1 + rng() * 3, 1 + rng() * 3);
        }
      } else {
        ctx.fillStyle = "#a0a0a0";
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 400; i++) {
          const v = 120 + rng() * 80;
          const sz = 2 + rng() * 5;
          ctx.fillStyle = `rgb(${v + 10},${v + 5},${v})`;
          ctx.beginPath();
          ctx.arc(rng() * 256, rng() * 256, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return wrapTexture(c, 4, 4);
    }),
    normalMap: getCached(`${key}_normal`, () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(type === "flagstone" ? 11 : type === "concrete" ? 21 : 31);
      if (type === "flagstone") {
        for (let i = 0; i < 12; i++) {
          const x = (i % 4) * 64 + rng() * 10;
          const y = Math.floor(i / 4) * 85 + rng() * 10;
          ctx.strokeStyle = "#6060ff";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 2, y + 2, 56 + rng() * 8, 76 + rng() * 8);
        }
      } else {
        for (let i = 0; i < 300; i++) {
          ctx.fillStyle = `rgb(${120 + rng() * 20}, ${120 + rng() * 20}, ${220 + rng() * 35})`;
          ctx.fillRect(rng() * 256, rng() * 256, 2 + rng() * 4, 2 + rng() * 4);
        }
      }
      return wrapTexture(c, 4, 4);
    }),
  };
}

export function createWoodTexture() {
  return {
    map: getCached("wood_map", () => {
      const [c, ctx] = makeCanvas(256, 128);
      ctx.fillStyle = "#8B6914";
      ctx.fillRect(0, 0, 256, 128);
      const rng = seededRandom(67);
      for (let y = 0; y < 128; y++) {
        const v = rng() * 30 - 15;
        ctx.strokeStyle = `rgb(${139 + v}, ${105 + v}, ${20 + v * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `rgba(60, 40, 10, ${0.2 + rng() * 0.3})`;
        ctx.lineWidth = 0.5 + rng();
        const y = rng() * 128;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + (rng() - 0.5) * 10);
        ctx.stroke();
      }
      return wrapTexture(c, 2, 2);
    }),
    normalMap: getCached("wood_normal", () => {
      const [c, ctx] = makeCanvas(256, 128);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 128);
      const rng = seededRandom(68);
      for (let i = 0; i < 15; i++) {
        ctx.strokeStyle = `rgb(${110 + rng() * 30}, ${110 + rng() * 30}, 255)`;
        ctx.lineWidth = 1 + rng() * 2;
        const y = rng() * 128;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y + (rng() - 0.5) * 8);
        ctx.stroke();
      }
      return wrapTexture(c, 2, 2);
    }),
  };
}

export function createBrickTexture(color = "#8B4513") {
  return {
    map: getCached(`brick_${color}_map`, () => {
      const [c, ctx] = makeCanvas(256, 256);
      const rng = seededRandom(44);
      ctx.fillStyle = "#888";
      ctx.fillRect(0, 0, 256, 256);
      const bw = 60, bh = 28, gap = 4;
      for (let row = 0; row < 9; row++) {
        const offset = row % 2 === 0 ? 0 : bw / 2 + gap / 2;
        for (let col = -1; col < 5; col++) {
          const x = col * (bw + gap) + offset;
          const y = row * (bh + gap);
          const r = parseInt(color.slice(1, 3), 16) + rng() * 20 - 10;
          const g = parseInt(color.slice(3, 5), 16) + rng() * 15 - 7;
          const b = parseInt(color.slice(5, 7), 16) + rng() * 15 - 7;
          ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
          ctx.fillRect(x, y, bw, bh);
        }
      }
      return wrapTexture(c, 3, 3);
    }),
    normalMap: getCached(`brick_${color}_normal`, () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#7070ff";
      ctx.fillRect(0, 0, 256, 256);
      const bw = 60, bh = 28, gap = 4;
      for (let row = 0; row < 9; row++) {
        const offset = row % 2 === 0 ? 0 : bw / 2 + gap / 2;
        for (let col = -1; col < 5; col++) {
          const x = col * (bw + gap) + offset;
          const y = row * (bh + gap);
          ctx.fillStyle = "#8080ff";
          ctx.fillRect(x, y, bw, bh);
        }
      }
      return wrapTexture(c, 3, 3);
    }),
  };
}

export function createSoilTexture() {
  return {
    map: getCached("soil_map", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(88);
      for (let i = 0; i < 2000; i++) {
        const v = rng() * 40 - 20;
        const sz = 1 + rng() * 3;
        ctx.fillStyle = `rgb(${107 + v}, ${66 + v * 0.8}, ${38 + v * 0.5})`;
        ctx.fillRect(rng() * 256, rng() * 256, sz, sz);
      }
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(200, 180, 150, ${0.2 + rng() * 0.3})`;
        ctx.beginPath();
        ctx.arc(rng() * 256, rng() * 256, 1 + rng() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return wrapTexture(c, 4, 4);
    }),
    normalMap: getCached("soil_normal", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(89);
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = `rgb(${120 + rng() * 20}, ${120 + rng() * 20}, ${220 + rng() * 35})`;
        const sz = 1 + rng() * 3;
        ctx.fillRect(rng() * 256, rng() * 256, sz, sz);
      }
      return wrapTexture(c, 4, 4);
    }),
  };
}

export function createWaterNormalMap() {
  return getCached("water_normal", () => {
    const [c, ctx] = makeCanvas(256, 256);
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, 256, 256);
    const rng = seededRandom(101);
    for (let i = 0; i < 60; i++) {
      const cx = rng() * 256;
      const cy = rng() * 256;
      const r = 10 + rng() * 40;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${120 + rng() * 20}, ${120 + rng() * 20}, 255, 0.3)`);
      grad.addColorStop(1, "rgba(128, 128, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return wrapTexture(c, 3, 3);
  });
}

export function createMulchTexture() {
  return {
    map: getCached("mulch_map", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#5c3a1e";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(111);
      for (let i = 0; i < 500; i++) {
        const x = rng() * 256;
        const y = rng() * 256;
        const angle = rng() * Math.PI;
        const len = 4 + rng() * 12;
        const w = 1 + rng() * 3;
        const v = rng() * 40 - 20;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = `rgb(${92 + v}, ${58 + v * 0.7}, ${30 + v * 0.4})`;
        ctx.fillRect(-len / 2, -w / 2, len, w);
        ctx.restore();
      }
      // Color dots for flowers
      for (let i = 0; i < 60; i++) {
        const colors = ["#ff6b8a", "#ffb347", "#fff44f", "#87ceeb", "#dda0dd"];
        ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
        ctx.beginPath();
        ctx.arc(rng() * 256, rng() * 256, 2 + rng() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      return wrapTexture(c, 4, 4);
    }),
    normalMap: getCached("mulch_normal", () => {
      const [c, ctx] = makeCanvas(256, 256);
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 256);
      const rng = seededRandom(112);
      for (let i = 0; i < 300; i++) {
        const x = rng() * 256;
        const y = rng() * 256;
        const angle = rng() * Math.PI;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = `rgb(${110 + rng() * 30}, ${110 + rng() * 30}, ${230 + rng() * 25})`;
        ctx.fillRect(-4, -1, 8 + rng() * 6, 1 + rng() * 2);
        ctx.restore();
      }
      return wrapTexture(c, 4, 4);
    }),
  };
}
