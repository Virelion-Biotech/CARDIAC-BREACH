# CARDIAC//BREACH — Art Direction and Graphics Standards

This document records the visual patterns adopted after studying mature open-source game projects with strong, sustained visual systems.

## Reference patterns

### Mindustry — atlas discipline and named iconography
Mindustry organizes sprites into predictable atlas namespaces and resolves content to named sprite regions. The useful lesson is not the specific art style; it is the consistency of **content name → asset name → atlas frame → UI presentation**. CARDIAC//BREACH follows the same principle with `assets/game-art/manifest.json`. citehttps://mindustrygame.github.io/wiki/modding/4-spriting/

### Endless Sky — readable silhouettes at every scale
Endless Sky deliberately designs sprites at a larger working size so they remain crisp when rotated or displayed smaller, and its UI keeps a restrained monochrome base with only key information receiving strong accent color. The project also calls out tiny graphical frills—parallel traces, micro numerals and geometric details—as a way to suggest complexity without adding clutter. CARDIAC//BREACH therefore designs icons at 2x logical size, uses bold silhouettes, and adds restrained internal geometry rather than noisy decoration. citehttps://github.com/endless-sky/endless-sky/wiki/CreatingShips citehttps://github.com/endless-sky/endless-sky/wiki/Endless-Sky%27s-Vision

### Battle for Wesnoth — stateful hand-authored art and animation
Wesnoth treats sprites, animation frames, terrain variation, shadows and team-coloring as a coherent art pipeline. Its art guidance emphasizes fit-to-style specifications, readable silhouettes, intentional shadows and a controlled palette. CARDIAC//BREACH adopts this as a **state language**: healthy, stressed, damaged, fibrotic and recovering are differentiated by geometry and visual treatment, not color alone. citehttps://wiki.wesnoth.org/Create_art

### OpenRCT2 — visual identity is part of the game, not the website
OpenRCT2 is a mature management game that treats graphics, scenarios and interface as first-class game systems. The lesson for CARDIAC//BREACH is to avoid making the interface look like a generic business dashboard. Panels, controls, illustrations and scenario presentation should feel like instruments from the same fictional world. citehttps://github.com/OpenRCT2/OpenRCT2

### OpenTTD / OpenGFX — consistent multi-scale asset sets
OpenTTD separates graphics into dedicated base sets and supports multiple display scales. The useful pattern is a controlled visual asset library rather than ad-hoc individual images. CARDIAC//BREACH keeps scenario, agent, tissue and event art in a defined asset family and documents the frame contracts. citehttps://github.com/OpenTTD/OpenGFX2

## CARDIAC//BREACH visual grammar

### 1. Shape before color
At a glance, the player should be able to identify an agent or tissue state from silhouette alone. Color is an accent layer, not the semantic layer.

### 2. One lighting language
Small illustrations use a consistent upper-left key light and darker lower-right falloff. This creates a collection effect: the graphics feel authored by one visual team instead of assembled from unrelated SVGs.

### 3. Near-monochrome base
Most of the interface is desaturated blue-gray. High-chroma accents are reserved for:

- lime / mint — healthy, selected, actionable
- amber — stress / warning
- red-pink — damage / critical danger
- violet — fibrosis / remodeling
- blue — oxygen / perfusion / recovery

### 4. Secondary detail is geometric
Tiny circuit traces, scanlines, diagnostic rings, node links and calibration marks are allowed. They should reward attention without becoming required reading.

### 5. State changes should animate
A player-caused or simulation-critical change should have a visual response. A normal idle state should remain quiet.

The hierarchy is:

`idle → local pulse → state transition → critical alarm`

not constant motion everywhere.

### 6. Tissue is a field, not a spreadsheet
The 18×12 tissue grid should read as one living surface. The current visual treatment adds vascular threads, soft depth, selected-region reticles, agent anchors and vignette shaping so the board has a material identity.

### 7. Agents are physical anchors
Every deployed agent has a visible target, an atlas icon, and a local pulse. Deployment therefore has spatial meaning on the board.

### 8. Scenario art should answer the question “what kind of trouble is this?”
Scenario cards are illustrations first and labels second. The player should understand the broad threat from the image before reading the title.

### 9. Event cards are illustrated moments
An event card should feel like an in-world alert, not a generic modal dialog. It therefore gets a dedicated visual panel, a threat-specific crop, stronger title hierarchy and a limited set of action choices.

### 10. Beginner UX gets the strongest graphic emphasis
Tutorial overlays use visual targeting, arrows and animated focus because the player must know exactly what to do. Once the player becomes proficient, the same visuals become quiet affordances rather than constant narration.

## Asset contracts

- Agent atlas logical frame: 128×128 SVG space; displayed around 40–44px in compact UI.
- Scenario art: five coherent panels with shared frame geometry.
- Tissue-state art: five states with distinct shape language.
- Event art: three primary event families plus a neutral fallback.
- All artwork is original for CARDIAC//BREACH and contains no copied game assets.

## Quality gate

Before shipping a new asset, check:

1. Is it recognizable at 32–44px?
2. Does its silhouette distinguish it from neighboring assets?
3. Does it still make sense if desaturated?
4. Does it match the shared lighting direction?
5. Does it use the accent palette sparingly?
6. Does its motion communicate a state transition rather than decorate the screen?
7. Does it improve player understanding, mood or identity?

If none of the last three are true, the asset is probably decoration and should be simplified.
