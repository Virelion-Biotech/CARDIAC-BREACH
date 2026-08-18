# Contributing to CARDIAC//BREACH

## Principles

CARDIAC//BREACH is a browser strategy game with a hidden synthetic tissue model. Preserve the separation between **game rules**, **application lifecycle**, and **presentation**.

Do not add a new global state object, alternate engine, arbitrary initialization delay, or UI subsystem unless the existing boundary cannot express the requirement.

## Source layout

- `mechanistic-engine-v3.js` — authoritative simulation rules loaded by the compatibility bridge.
- `src/core/` — modern ES-module ports/boundaries for new application code.
- `src/app/` — explicit application lifecycle and input ownership.
- `src/runtime/` — reusable infrastructure such as events and render scheduling.
- `legacy-compat.js` — the only compatibility bridge for older IIFE modules.
- `tests/unit/` — fast Node unit tests.
- `tests/` — Playwright browser/integration tests.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm start
```

Then open `http://127.0.0.1:4173`.

## Testing expectations

Every change to game rules should preserve:

1. Deterministic seeded runs.
2. Spatial placement semantics.
3. Save/load behavior.
4. Player-facing crisis flow.
5. Accessibility and keyboard navigation.

Every architecture change should keep `CBCompat` as the only legacy bridge and must not introduce timing-based initialization.

## Tuning constants

When changing simulation constants, document **why** the constant exists and which gameplay behavior it is intended to control. Prefer named constants over unexplained numeric literals.
