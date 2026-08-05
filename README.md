# CatRobotics | Viewer

A robotics data visualization and diagnostics viewer built with React, TypeScript, and Vite.

## Requirements

- Node.js 22.12 or later
- pnpm 10.34.5

## Installation

Enable Corepack and install the dependencies:

```sh
corepack enable
pnpm install --frozen-lockfile
```

## Development

Start the Vite development server:

```sh
pnpm dev
```

Open the URL shown in the terminal in your browser.

## Production build

Create an optimized production build:

```sh
pnpm web:build:prod
```

The generated files are written to `web/dist`.

## Preview

Preview the production build locally:

```sh
pnpm exec vite preview --outDir web/dist
```

## Other commands

```sh
pnpm typecheck
pnpm lint:ci
pnpm test
```
