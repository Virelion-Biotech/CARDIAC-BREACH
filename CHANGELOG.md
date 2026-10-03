# Changelog

## 4.1.0 — 2026-08-19

### Engineering
- Moved the application lifecycle to `src/app/controller.mjs` and `src/bootstrap.mjs`.
- Added an ES-module game-engine port for all new application code.
- Centralized legacy compatibility in `legacy-compat.js`.
- Removed the retired v2 adapter from the runtime and deleted its obsolete test suite.
- Added a frame-coalescing render scheduler.
- Added keyboard navigation for tissue-cell selection.
- Added Node unit tests for reusable runtime primitives.
- Replaced stale v2 browser tests with v4 gameplay and lifecycle contracts.
- Added reproducible static build packaging.
- Added contributor and architecture documentation.
- Added CI expectations for unit, browser, and syntax checks.

### Compatibility
- Existing legacy UI modules continue to receive the state they need through `CBCompat`.
- Save/load, evolution, audio, tutorial, graphics, crisis flow, and spatial intervention behavior are preserved.

### Performance
- Rendering is coalesced onto animation frames.
- Simulation timing remains synchronous and deterministic; no Worker migration is introduced without profiling evidence.
