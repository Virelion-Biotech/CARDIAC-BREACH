# CARDIAC//BREACH

**A browser-based cardiac tissue strategy simulator with an evolving synthetic-agent layer.**

You are not controlling a single cell. You manage a dynamic tissue system while deploying a limited team of autonomous response agents. The simulation is intentionally synthetic and abstract: it is a game, not a biological intervention tool.

## Play

Open `index.html` locally, or enable GitHub Pages for the repository. There is no build system, package manager, backend, or external dependency.

## v0.3 — Agent Evolution

The game now adds an **Agent Evolution Lab** on top of the tissue simulator.

### Evolution loop

1. Seed a population of eight synthetic agent policies.
2. Evaluate policies against the current game outcome.
3. Rank candidates by abstract fitness.
4. Preserve an elite subset.
5. Mutate elite policies into a new generation.
6. Repeat across generations.
7. Inspect candidate level, experience, fitness, and policy traits.
8. Export the evolution state with the run record.

The evolving traits are purely abstract game-policy parameters:

- Stability
- Recovery
- Inflammation control
- Perfusion
- Maturation
- Electrical safety

The system uses selection, mutation, experience accumulation, and generation tracking. It does **not** encode real-world biological procedures.

## v0.2 — Tissue Dynamics

The game models a heterogeneous **18 × 12 tissue field (216 cells)** with distinct cell populations and spatial state.

### Tissue model

- Cardiomyocytes
- Fibroblasts
- Endothelial cells
- Immune cells
- Cell-level stress, damage, oxygen, energy, scar and maturation states
- Spatial neighbor interactions
- Local injury propagation
- Cell loss under severe combined stress/damage

### System-level state

- Viability
- Functional performance
- Inflammation
- Fibrosis
- Oxygen availability
- Electrical instability
- Metabolic reserve
- Intervention energy

### Scenarios

- Ischemic injury
- Inflammatory cascade
- Progressive fibrosis
- Maturation failure
- Electrical instability

### Agent Foundry

Six response-agent archetypes are available:

- Stabilizer
- Regenerator
- Immune Modulator
- Vascular Support
- Maturation Agent
- Electrical Buffer

Up to five agents can be deployed in a run. Agents have energy costs and different system-level trade-offs. Custom agents can be named and instantiated from these archetypes.

### Run mechanics

- 24 simulated days
- Randomized initial tissue heterogeneity
- Limited energy economy
- Critical failure events
- Region inspection
- Neighbor sampling
- Live trajectory chart
- End-of-run score
- Exportable JSON run record

## Roadmap

Next: connect evolved policies to actual in-game agent modifiers, add persistent progression, procedural events, scenario modifiers, agent specialization and a multi-run training sandbox. Later versions can introduce more sophisticated learning while keeping the environment synthetic and non-operational.

## Design principle

> **There is no universally optimal intervention.**

Improving one tissue property can damage another. The player wins by managing the whole system rather than maximizing a single metric.

## Safety / scope

This project is an educational and entertainment simulation. Biological variables and relationships are deliberately simplified and synthetic. It does not model real pathogens, provide experimental protocols, or provide actionable instructions for manipulating real biological systems.

## License

MIT
