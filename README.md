# Gradient

A 2D landscape design web application for creating professional landscaping plans. Draw property layouts with structures, hardscape, softscape, and water features, then export print-ready designs with material summaries.

## Features

- **Drawing tools** — Draw boundaries, houses, fences, pathways, driveways, patios, retaining walls, trees, shrubs, flower beds, gardens, lawns, ponds, pools, irrigation, and text annotations
- **Editing** — Select, move, copy/paste, duplicate, delete objects with full undo/redo support
- **Layers** — Show/hide, lock/unlock, and reorder objects by z-index
- **Measurement** — Measure tool for distances and dimensions on the canvas
- **Snap-to-grid** — 1/12 grid spacing for precise alignment
- **Export** — Generate print layouts and material summaries (count, area, length by object type)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Konva (HTML5 canvas), Zustand (state)
- **Backend:** Express.js
- **Infrastructure:** Pulumi, AWS ECS Fargate Spot, Docker

## Getting Started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `1` / `2` / `3` | Switch tools |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate |
| `Delete` | Delete selected |
| `Escape` | Deselect |

## Deployment

Deployed as a Docker container on AWS ECS Fargate Spot at [gradient.cwnel.com](https://gradient.cwnel.com).

```bash
npm run build       # Build for production
npm run preview     # Preview infrastructure changes
npm run up          # Deploy infrastructure
```
