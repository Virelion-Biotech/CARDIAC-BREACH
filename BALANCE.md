# CARDIAC//BREACH balance pass

## Current design targets
- No single agent should solve every scenario.
- Every base agent should have a clear strength and a meaningful opportunity cost.
- Evolved agents should be stronger in a narrow role rather than universally dominant.
- Energy is intended to force composition decisions rather than simply limiting total clicks.
- Viability and function are separate objectives: preserving cells is not identical to preserving cardiac performance.

## Agent roles
| Agent | Primary value | Trade-off |
|---|---|---|
| Stabilizer | stress / secondary injury control | modest direct recovery |
| Regenerator | viability recovery | higher energy pressure |
| Immune Modulator | inflammatory control | weak against isolated electrical failure |
| Vascular Support | oxygen + function | indirect benefit |
| Maturation Agent | long-term function | slow payoff |
| Electrical Buffer | arrhythmia control | limited tissue recovery |

## Testing checklist
- Run every scenario with no agents.
- Run every scenario with each single base agent.
- Run mixed teams with a maximum of five agents.
- Verify evolved policies do not create runaway positive feedback.
- Check that archived agents remain reproducible after reload.
- Check score trajectory after restoring a checkpoint.

## Design rule
Balance should be changed through explicit simulation parameters, not hidden UI multipliers. Every major balance change should be documented here so the game remains auditable.
