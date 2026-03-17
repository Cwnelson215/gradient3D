# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

Gradient is a 2D landscape design web application for creating professional landscaping plans. Users draw property layouts with landscape elements (structures, hardscape, softscape, water features), measure dimensions, manage layers, and export designs as print-ready layouts with material summaries.

The app is containerized and deployed on the portfolio platform. Infrastructure is defined with Pulumi (TypeScript) and references shared AWS resources (VPC, ALB, ECS cluster) from the platform stack via `pulumi.StackReference`.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Konva/React-Konva (canvas rendering), Zustand + Immer (state management), polygon-clipping (geometry)
- **Backend:** Express.js serving the built client + health endpoint
- **Infrastructure:** Pulumi, AWS (ECR, ECS Fargate Spot, ALB, Route53, CloudWatch), Docker

## Commands

```bash
# Application
npm install           # Install dependencies
npm run dev           # Run locally (http://localhost:3000)
npm run build         # Build for production
npm start             # Start production server

# Infrastructure (Pulumi)
npm run preview       # Preview infra changes
npm run up            # Deploy infra
npm run destroy       # Tear down infra
```

## Source Structure

```
src/
├── client/                 # React SPA (built to dist/client)
│   └── src/
│       ├── App.tsx         # Main app with keyboard handlers
│       ├── main.tsx        # React entry point
│       ├── plan/           # Canvas drawing system
│       │   ├── PlanView.tsx      # Konva Stage + tool coordination
│       │   ├── shapes/           # Renderables (House, Polygon, Point, etc.)
│       │   ├── tools/            # Drawing logic (SelectTool, DrawPolygon, Measure, etc.)
│       │   ├── layers/           # Canvas layers (Grid, Objects, Interaction, Labels)
│       │   └── patterns/         # SVG patterns for fills
│       ├── store/          # Zustand store (landscape state, undo/redo)
│       ├── types/          # TypeScript types (LandscapeObject, ObjectRegistry)
│       ├── export/         # Export generators (print layout, material summary)
│       ├── ui/             # UI components (toolbar, panels, modals, menus)
│       └── utils/          # Utilities (coordinates, polygon math)
├── server/                 # Express server
│   └── index.ts            # Serves client dist + health endpoint
```

## Architecture

**App contract:** The container must (1) listen on the configured port (default 3000) and (2) expose `GET /health` returning HTTP 200.

**Infrastructure (`index.ts`):** Defines app-specific AWS resources:
- ECR repository (`portfolio/gradient`) with lifecycle policy (keep last 10 images)
- Security group allowing traffic from the shared ALB
- ALB target group + host-based listener rule (`gradient.cwnel.com`)
- ECS Fargate task definition + service (Fargate Spot only)
- Scheduled scaling (scale to zero at 10 PM, back up at 6 AM, America/Denver)

All shared resources (VPC, ALB, ECS cluster, Route53, ACM, CloudWatch log group) come from the platform stack and are imported via `pulumi.StackReference`.

## Key Files

- `src/client/` — React SPA source
- `src/server/` — Express server
- `index.ts` — Pulumi infrastructure definition
- `Pulumi.yaml` — Project metadata
- `Pulumi.dev.yaml` — Environment config (appName, subdomain, platformStack, cpu, memory, etc.)
- `Dockerfile` — Container build definition
- `.github/workflows/deploy.yml` — CI/CD pipeline

## Conventions

- **Naming:** Resources prefixed with `appName`. All tagged with Project, App, ManagedBy.
- **Config:** Environment-specific values in `Pulumi.{stack}.yaml`. Secrets via `pulumi config set --secret`.
- **Logs:** CloudWatch at `/ecs/portfolio-dev/gradient`, 14-day retention.
- **Platform stack reference:** `cwnelson/portfolio-platform/dev`
- **Health check:** `GET /health` must return HTTP 200 — this is used by both the ALB target group and the ECS container health check.
- **State management:** Zustand store with Immer for immutable updates. Undo/redo history capped at 50 levels.
- **Canvas rendering:** All drawing happens on Konva layers (Grid, Objects, Interaction, Labels). Shapes snap to a 1/12 grid.
