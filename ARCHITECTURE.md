# CARDIAC//BREACH Architecture

## Runtime ownership

The application has one authoritative runtime owner: `CardiacAppController` in `src/app/controller.mjs`.

```text
Browser
  └─ src/bootstrap.mjs
      ├─ game port
      ├─ CardiacAppController
      │   ├─ authoritative game state
      │   ├─ lifecycle
      │   ├─ input
      │   └─ save/load
      ├─ render scheduler
      └─ legacy compatibility boundary
             └─ older presentation IIFEs
```

The simulation rules are still loaded from the established mechanistic engine and exposed to modern code through `src/core/game-port.mjs`. This is an intentional strangler migration: the playable game remains stable while new code stops depending directly on globals.

## Global policy

`window.CBApp` is the single application handle required by legacy presentation modules. `window.CBCompat` is the only state-mirroring compatibility surface.

New modules must **not** attach mutable gameplay state to `window`.

## Engine versions

v3/v4 is the only engine loaded by `index.html`. The older v2 implementation is no longer part of the runtime and its test suite has been removed. The old source may remain temporarily for historical recovery, but it is not a supported consumer API.

## Rendering

State changes are coalesced through `RenderScheduler` so several synchronous events collapse into one animation-frame refresh. This avoids redundant canvas/UI work without changing simulation timing.

## Performance

The current model is intentionally bounded: 216 cells, local neighborhood coupling, finite interventions, and deterministic turn resolution. Before moving simulation work to a Worker, benchmark real devices first. A Worker should be introduced only when profiling demonstrates that turn resolution consumes a meaningful frame budget.

## Testing

- Node unit tests validate reusable module primitives.
- Playwright validates application lifecycle and gameplay contracts.
- Architecture tests prevent reintroduction of timer-based bootstrapping and retired v2 adapters.
- CI runs tests on every push and pull request to `main`.
