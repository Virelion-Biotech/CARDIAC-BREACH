# CARDIAC//BREACH

**A browser-based cardiac tissue strategy simulator with evolving, deployable synthetic agents.**

You are not controlling a single cell. You manage a dynamic tissue system while deploying a limited team of response agents. The simulation is intentionally synthetic and abstract: it is a game, not a biological intervention tool.

## v0.4 — Evolved Agents Become Playable

The evolution system now changes gameplay rather than only producing statistics.

### Agent lifecycle

**Seed → Evaluate → Evolve → Archive → Deploy → Run → Learn**

- Seed an eight-agent synthetic population.
- Evaluate policies against game performance.
- Select and mutate high-fitness candidates.
- Archive individual candidates permanently for the current session.
- Deploy archived candidates alongside the six fixed archetypes.
- Evolved agents consume energy and count toward the five-agent deployment limit.
- Their policy traits directly modify simulation outcomes.
- Each deployed evolved agent tracks uses during a run.

### Evolved policy traits

Each policy has six abstract parameters:

- Stability
- Recovery
- Inflammation control
- Perfusion
- Maturation
- Electrical safety

An evolved policy can therefore become a specialized strategy rather than simply a higher-level copy of a fixed agent.

## v0.3 — Agent Evolution

The Agent Evolution Lab uses selection, mutation, experience accumulation and generation tracking. Fitness is a game score rather than a biological objective.

## v0.2 — Tissue Dynamics

The game models a heterogeneous **18 × 12 tissue field (216 cells)** with:

- Cardiomyocytes
- Fibroblasts
- Endothelial cells
- Immune cells
- Cell-level stress, damage, oxygen, energy, scar and maturation
- Spatial neighbor interactions
- Local injury propagation
- Cell loss under severe combined stress/damage

System state includes viability, function, inflammation, fibrosis, oxygen, electrical instability, metabolic reserve and intervention energy.

### Scenarios

- Ischemic injury
- Inflammatory cascade
- Progressive fibrosis
- Maturation failure
- Electrical instability

### Fixed Agent Foundry

- Stabilizer
- Regenerator
- Immune Modulator
- Vascular Support
- Maturation Agent
- Electrical Buffer

Up to five total agents can be deployed in a run, including evolved agents.

### Run mechanics

- 24 simulated days
- Randomized initial tissue heterogeneity
- Limited energy economy
- Critical failure events
- Region inspection
- Neighbor sampling
- Live trajectory chart
- End-of-run score
- Exportable JSON run record including evolved-agent archive

## Next

The next major layer is persistent progression: unlockable agent classes, permanent player research upgrades, procedural events, scenario modifiers, multi-run training, leaderboards and a dedicated agent-training sandbox.

## Design principle

> **There is no universally optimal intervention.**

Improving one tissue property can damage another. The player wins by managing the whole system rather than maximizing a single metric.

## Safety / scope

CARDIAC//BREACH is an educational and entertainment simulation. Biological variables and relationships are deliberately simplified and synthetic. It does not model real pathogens, provide experimental protocols, or provide actionable instructions for manipulating real biological systems.

## License

MIT
