# CARDIAC//BREACH v2 — Gameplay & Architecture

## The actual game

CARDIAC//BREACH is a deterministic, turn-based spatial strategy game built around a synthetic cardiac tissue board.

A run is a sequence of **planning → intervention → resolution → inspection → adaptation** turns.

The player has two commands per day. Every placed agent has:

- a target cell,
- a range,
- an energy cost,
- a command-point cost,
- local effects,
- neighbour effects,
- and a strategic niche.

The goal is not to maximize one percentage. It is to control the active crisis while preserving the rest of the tissue.

## Why this is different from a dashboard

The board has spatial state. Two identical agents placed on different cells can produce different outcomes because they cover different local tissue and interact with different hotspot traits.

Each run is deterministic from its seed. A run can therefore be replayed exactly, compared, debugged, and shared.

## Tactical turn

1. Inspect the board.
2. Identify the most dangerous hotspot.
3. Place one or two agents where their ranges matter.
4. Spend the available command points deliberately.
5. Resolve the day.
6. Read the changed tissue and mission state.
7. Adapt the next turn.

## Spatial rules

Cells have abstract local traits such as:

- PERFUSION RICH
- LOW OXYGEN
- INFLAMMATORY
- SCAR PRONE
- ELECTRICALLY SENSITIVE
- RECOVERY NICHE

Agents have different ranges and local/adjacent effects. The map is therefore a tactical board, not a visualization-only background.

## Mission rules

Each scenario has a primary goal and secondary objectives. A successful run requires surviving the 24-day window while controlling the scenario-specific pressure and resolving enough regional hotspots.

## Engineering philosophy

The game has one authoritative simulation core: `game-core-v2.js`.

UI, graphics, audio, persistence and tutorials should consume or display core state rather than implement competing game rules.

The browser remains intentionally lightweight. Complexity belongs in **game decisions and simulation rules**, not artificial engine infrastructure.
