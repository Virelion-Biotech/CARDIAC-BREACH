# CARDIAC//BREACH

**A browser-based cardiac tissue strategy game with a synthetic tissue simulator, evolving deployable agents, procedural crises, and campaign progression.**

You are not controlling a single cell. You manage a dynamic heterogeneous tissue system while deploying a limited response team. The simulation is intentionally synthetic and abstract: it is a game and educational experience, not a biological intervention tool.

## v0.9 — Full Strategy Game Layer

CARDIAC//BREACH now wraps the tissue simulator in a complete player loop:

**Diagnose → Prioritize → Intervene → Observe → Adapt → Recover → Debrief → Evolve**

### Campaign

The game now progresses through themed chapters:

1. First Response
2. The Cascade
3. Remodeling
4. Recovery
5. Conduction
6. Combined Breach

Successful runs advance the campaign and introduce progressively harder strategic contexts.

### Spatial tactics

The 18 × 12 field is now an active game board rather than only a visualization. Runs generate regional hotspots such as perfusion bottlenecks, inflammatory foci, fibrotic niches, electrical hotspots, recovery zones and vulnerable regions. Players can click directly on the tissue to inspect regions and receive confidence-weighted threat information.

### Contextual decisions

Selected days can generate a regional command decision with three different responses. Decisions trade energy, survival, function, oxygen, remodeling and electrical stability against one another. No single option is universally correct.

### Procedural runs

Regional threats, severity, confidence and run narrative vary between runs. Scenario-specific recommendations provide a beginner entry point without removing experimentation.

### Explainability

The **WHY IS THIS HAPPENING?** panel compares state movement between days and highlights the largest changes, helping players understand the synthetic game mechanics rather than memorize a fixed strategy.

### Dynamic threat presentation

The command HUD shows:

- Current operation and goal
- Active regional threat
- Day / score / risk
- Recommended opening team
- Tactical feedback
- Run narrative
- Campaign state

The interface changes emphasis as tissue risk rises.

### Run debrief

Completed runs receive a composite score covering tissue outcome, energy efficiency, regional control and adaptive decisions. The debrief summarizes the final tissue state, regional control, and any discovered evolved-agent specialization.

### Agent discovery

Evolved policies can be recognized as discovered strategic roles such as perfusion specialist, repair specialist, immune specialist, conduction specialist or adaptive specialist based on their traits and observed deployment context.

### Existing simulation core

The underlying synthetic model retains:

- Cardiomyocytes
- Fibroblasts
- Endothelial cells
- Immune cells
- Cell-level stress, damage, oxygen, energy, scar and maturation
- Spatial neighbor interactions
- Local injury propagation
- Cell loss under severe combined stress/damage
- Viability, function, inflammation, fibrosis, oxygen, electrical instability and metabolic reserve

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

### Evolution lifecycle

**Seed → Evaluate → Evolve → Archive → Deploy → Run → Learn**

Evolved agents consume energy, count toward the deployment limit, and their abstract traits alter game outcomes.

### Quality-of-life systems

- Guided first-run instructions
- Autosave and checkpoint restore
- Pause and simulation-speed controls
- Keyboard shortcuts
- Scenario-specific recommendations
- Risk radar
- Challenge modifiers
- Mission contracts
- Achievements and career statistics
- Exportable JSON run records
- Responsive mobile layout

## Design principle

> **There is no universally optimal intervention.**

Improving one tissue property can damage another. The player wins by managing the whole system rather than maximizing a single metric.

## Safety / scope

CARDIAC//BREACH is an educational and entertainment simulation. Biological variables and relationships are deliberately simplified and synthetic. It does not model real pathogens, provide experimental protocols, or provide actionable instructions for manipulating real biological systems.

## License

MIT
