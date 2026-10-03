# CARDIAC//BREACH balance contract

The balance layer is intentionally **not** trying to make every agent equally strong. Each agent should have a reason to be selected, while no single agent or repeated stack should be the obvious answer across all scenarios.

## Base-agent roles

| Agent | Primary niche | Trade-off |
|---|---|---|
| Stabilizer | Long-horizon tissue preservation / fibrosis | Lower direct recovery throughput |
| Regenerator | Direct recovery and function | High energy cost + diminishing returns when stacked |
| Immune Modulator | Inflammatory scenario | Less impact outside its niche |
| Vascular Support | Ischemia / oxygen-limited tissue | Diminishing function returns when stacked |
| Maturation Agent | Maturation-failure scenario | Smaller general-purpose effect |
| Electrical Buffer | Arrhythmia scenario | Specialized outside electrical instability |

## Balance rules

1. **Niche viability:** every base agent must improve at least one scenario by a measurable margin.
2. **No scenario runaway:** the best single agent should not exceed the second-best by more than 15 score points in the automated matrix.
3. **No universal winner:** no base agent may win more than three of five scenarios.
4. **Diminishing returns:** repeated copies of a role receive penalties so composition matters more than raw stacking.
5. **Evolved-policy ceiling:** evolved policies have bounded per-trait effects and bounded deployment cost.
6. **Evolved diversity:** mutation is deliberately moderate and fitness weights retain trait identity rather than letting the current run outcome completely determine the next generation.
7. **State safety:** all tracked state variables remain in [0,100], energy remains non-negative, and a 24-day run produces exactly 24 history points.

## Test strategy

`tests/game.spec.js` runs browser-level Playwright tests covering boot, full-run invariants, deployment limits, checkpoint restoration, evolutionary diversity, a 5×6 agent/scenario balance matrix, and duplicate-stack behavior. CI runs the Chromium suite on pushes and pull requests.

The thresholds are deliberately conservative: the goal is to catch strategic collapse, not to force identical performance.
