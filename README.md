# CARDIAC//BREACH

**A browser-based cardiac tissue strategy simulator.**

You are not controlling a single cell. You are managing a dynamic tissue system while deploying a limited team of autonomous response agents. The simulation is intentionally synthetic and abstract: it is a game, not a biological intervention tool.

## Play

Open `index.html` locally, or enable GitHub Pages for the repository. There is no build system, package manager, backend, or external dependency.

## v0.2 — Tissue Dynamics

The game now models a heterogeneous **18 × 12 tissue field (216 cells)** with distinct cell populations and spatial state.

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

Each scenario changes the system through a different abstract pressure profile.

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

The next planned layer is a true **Agent Evolution system**: agents with internal policies, upgrade paths, learned performance statistics, procedural tissue events, scenario modifiers, and multi-run progression. A later version can add a training sandbox where agents compete across many synthetic episodes before deployment.

## Design principle

CARDIAC//BREACH is built around one rule:

> **There is no universally optimal intervention.**

Improving one tissue property can damage another. The player wins by managing the whole system rather than maximizing a single metric.

## Safety / scope

This project is an educational and entertainment simulation. Biological variables and relationships are deliberately simplified and synthetic. It does not model real pathogens, provide experimental protocols, or provide actionable instructions for manipulating real biological systems.

## License

MIT
