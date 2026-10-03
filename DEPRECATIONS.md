# Deprecated Runtime Surfaces

These files are retained only as migration/reference material and are **not** part of the supported runtime entry path:

- `game-core-v2.js` — retired v2 engine implementation.
- other root-level IIFE feature modules — legacy presentation integrations only.

The supported application boundary is:

- `src/bootstrap.mjs`
- `src/app/controller.mjs`
- `src/core/game-port.mjs`
- `legacy-compat.js` only when an older UI module cannot yet consume the module API directly.

Do not add new references to `game-core-v2.js`, `window.CBGameV2`, or new mutable `window` gameplay state.
