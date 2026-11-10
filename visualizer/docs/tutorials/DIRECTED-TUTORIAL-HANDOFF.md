# Directed tutorials — implementation and Claude handoff

Updated 2026-11-10. This supersedes the earlier interpretation of tutorial mode as a smaller dashboard.

## User's intended experience

Direct attention, like an edited teaching video. At any moment show only what explains the current operation. Present the responsible code, transition to the affected structure, highlight the effect, then move on. Do not keep the code, reasoning, timeline, trees, heaps, and counters on screen together. Reasons should explain the need before the implementation choice. Inputs remain arbitrary within each visualizer's supported validation limits.

## Plan implemented

1. Separate presentation scenes from immutable solver frames.
2. Step-by-step presents Code → Effect for each frame. Reason-first presents Why → Code → Effect. Each is a real playback position, so Play, Pause, Next, Prev, and the timeline operate on scenes.
3. Use a single movable Story stage with fade-out/fade-in transitions. An effect retains only its causal code line and relevant variables. It does not retain the complete code window or the preceding reasoning paragraph.
4. Author different focus rules for 1606 scheduling and 100 recursive tree comparison.
5. Put Input & examples and Story in the existing `LuminoDockPanel` compatibility wrapper (implemented by local React `DockWorkspace`). Keep the panel shelf visible in both modes. Preserve full-view layout while tutorial is active.
6. Share one View menu between home and problem headers: zoom out/in/reset plus Normal/Wide/Full layout.

## Current implementation

- `src/components/shared/tutorialSequence.js`: builds keyed presentation beats `{key, frameIndex, kind, scene}`. The adapter runs on actual trace frames. There is no second solver and no invented intermediate state.
- `AlgorithmWorkspace.jsx`: maps scene positions to solver frames. Mode changes pause and preserve the current frame/input. Full and tutorial docks remain mounted separately, preserving arrangement and panel visibility. The tutorial Input panel starts minimized; restore it from the footer. Input remains usable after parse errors. Normal view exposes Algorithm state, Story, Solution code, and Input panels.
- `TutorialScene.jsx`: Why is narration only; Code is a highlighted five-line code window with an optional full-code zoom; Effect shows the causal line, current variables, and domain visual. `AnimatePresence` waits for the outgoing scene to fade. Reduced-motion settings disable movement. Tutorial pacing starts at 2400 ms/scene; its slider supports 1000–5000 ms.
- `DockWorkspace.jsx`: supports `initialCollapsed`, native tab drops onto the footer to minimize, plus existing collapse/restore buttons and Move menu. Global drag cleanup handles a source tab disappearing. Do not claim touch drag support; the button/Move alternatives remain available.
- `ViewMenu.jsx/.css`: reused by home and problem pages (also available for playground). `ZoomControls` has an embedded mode, so this popover does not leave a floating zoom toolbar on problem pages.

### Problem 1606 — scheduling

Both sorted-list and virtual-key-heap approaches use the directed sequence. The focus adapter explicitly selects:

- arrival → current request;
- release condition/pop → busy heap;
- insertion → busy/free relationship;
- binary-search comparison → free list;
- reservation → free structure and selected server;
- finish calculation → current execution interval only;
- counting → selected server;
- busy insertion → timeline and busy heap;
- final frequency comparison → results.

Two panels appear together only when their relationship explains the current operation. Off-screen endpoints do not get drawn as fake arrows.

Corrected code/trace mismatches discovered during UI review: finish-time calculation now has its own displayed code line and precedes the counter increment; list reservation has its own frame; virtual heap peek and pop are separate displayed operations. Python code agrees with these steps. Reserved servers are no longer mislabeled Available between free-pool removal and busy-heap insertion. Final answers are unchanged.

Heap focus still uses real operation snapshots and original indices. A heap operation can contain several logged sift comparisons; this implementation does **not** animate fabricated intermediate arrays. Emit immutable per-comparison frames before attempting that extension.

### Problem 100 — recursive tree comparison

Code → current node pair, with a focused SVG camera. Left/right scenes include immediate children; other comparisons show only the active pair. Null arguments are explicit. The result scene shows the final boolean. Hidden node counts identify omitted context; original node IDs/edges are retained.

The entry frame now maps to the function entry, not the null test. Displayed Python now evaluates left/right separately, matching the traced implementation instead of showing a short-circuit expression with a different execution order. Base-case/return narration comes from the actual frame.

## Continue in Claude

Read the current diff first and preserve other work, especially the concurrently edited FloatingPanel and CompactPlayback files. Do not overwrite them with this handoff's baseline.

Start by reviewing the two routed examples above, then expand to one different mechanism at a time. Suggested next candidates are 1882 (weighted server selection and waiting), 1871 (sliding reachable window), and a graph traversal with actual frontier/node transitions. Inspect their current traces before choosing the implementation. These are suggestions, not claims that they are already migrated.

For each problem:

1. Identify the operation sequence and the invariant. Inspect actual frames, displayed code, custom input parsing, and the routed component.
2. Fix mismatched code-line mappings and missing meaningful trace events first. Each effect must be caused by its shown code; checking a condition is not a transfer.
3. Author `tutorial({run, step, previousStep})` returning `{title, reason, action, variables, focus}`. Keep the reason problem-specific. For a frequency map explain initialization/increment; for Two Sum explain lookup-before-insertion. Do not reuse either explanation blindly.
4. Make the domain view consume `useTutorialScene()` and render only the relevant structures. Reuse shared cameras/heap components where their semantics fit. Graph focus must preserve real IDs, edges, and causal neighbors.
5. Use the shared scene sequence; do not reintroduce a permanently visible code/reasoning dashboard in tutorial mode. A connection may need two related structures; unrelated panels stay absent. Never use CSS merely to dim an entire dashboard.
6. Preserve full mode, input, current solver frame, and dock layout on toggling. Expose Input and Story through dock panels and the restore footer. Avoid another fixed input form or non-movable story box.
7. Verify custom inputs, backward stepping, condition-only frames, empty structures, result frames, and reduced motion. Check line-to-effect correctness, not only final answers. Use authored test inputs.
8. Update this document with exact IDs implemented and evidence. Do not claim the whole catalogue supports tutorials.

## Verification record

- 30 targeted sequence, solver, tutorial, and dock tests passed with `PYTHON=python3` (the existing Same Tree Python test otherwise looks for `python`).
- A server-render pass rendered 740 presentation scenes across both scheduling approaches and matching/empty-tree cases, confirming that code/reason scenes do not include domain visuals. This pass preceded the final scheduling trace corrections; targeted trace tests cover those corrections.
- Local Chrome: observed Same Tree code-only → focused node-pair effect, separate reason scene, Input/Story footer restore/collapse, and full-view footer restoration. Home and problem View menus expose zoom and layout; problem zoom changed from 100% to 110% and was reset.
- Local Chrome also verified 1606 finish-time code → timeline-only effect, counter code → selected-server effect, and the second approach’s timeline-to-busy-heap connection. Compact controls and responsive timeline sizing keep the focused diagrams and footer visible.
- Native drag testing exposed a lingering preview; global drag cleanup was added. Footer drop is implemented, but do not treat this as comprehensive drag/touch acceptance.
- Final `npx vite build` passed in 22.31 seconds, with the existing large-chunk warning. `git diff --check` passed. Both displayed scheduling Python variants were executed on custom inputs and matched trace results.
- No deployment or catalogue-wide migration has been performed.
