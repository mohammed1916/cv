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
- Problem 1971 (Find if Path Exists in Graph, BFS with queue frontier) migrated to the directed sequence. Trace fixes: visited marks now reflect real enqueue-time marks (previously dequeued vertices only); the not-found result points at `return false` (previously `return true`); added init, dequeue, destination, enqueue and skip frames with `kind` fields. `tutorial.js` authors problem-specific reasons; `BfsTutorial.jsx` consumes `useTutorialScene()` and draws only causal real-ID vertices and real incident edges, with the queue chips. Evidence: `algorithm.test.mjs` 6/6 passed with `PYTHON=/usr/local/bin/python3` and the nvm Node 24.22.1 runner; sequence check on four custom inputs (triangle-with-component, isolated source equal to destination, single vertex, 16-vertex star) confirmed both modes, backward traversal and code-line mapping; `npx vite build` passed. Not verified in a browser.
- Problem 1871 (Jump Game VII, sliding reachable window; `src/problems/Problem1871`, shared solver in `collectionStories/expansionBroadAlgorithms.js`) migrated to the directed sequence. Trace fixes: the displayed code was a five-line summary whose numbers did not match the Python (activeLine 10/11 highlighted nothing); the code is now the 11 Python lines and the solver sets `activeLine` per stage (init 3, loop 5, enter_check 6, enter 7, leave_check 8, leave 9, update 10, result 11, mapped in `trace.js`). Frames now separate loop/window, enter and leave condition checks (including condition-only frames when nothing enters or leaves), count changes, and the decision. The selection rule is unchanged: window `[i-maxJump, i-minJump]`, blocked `'1'` stays unreachable. `tutorial.js` authors problem-specific reasons; `index.jsx` consumes `useTutorialScene()` and renders only the reachable row (plus the input row for decisions) with the focus roles, with the full dashboard kept for full mode. `broad.js` was regenerated with `build:definition-groups`, touching only the 1871 entries. Evidence: `algorithm.test.mjs` 12/12 passed with `PYTHON=/usr/local/bin/python3` and the nvm Node 24.22.1 runner (brute force on 400 generated cases, displayed Python run against brute force, per-stage line mapping, running count equal to contributors at every decision, condition-only frames, result frame, authored presets 1-4); `npx vite build` passed in 22.52 seconds; a Vite SSR harness rendered 162 focused and full scenes across three custom inputs with no missing structures or empty-window notes (temporary harness removed). Not verified in a browser; reduced motion is inherited from `TutorialScene` (the 1871 view has no animations).
- No deployment or catalogue-wide migration has been performed.

### Problem 1882 — weighted server selection (directed)

Exact ID: 1882 (`src/problems/Problem1882`, shared solver `expansionBroadAlgorithms.js` 1882 block and spec line in `expansionBroadSpecs.js`).

- Trace: separate frames now exist for each arrival clock update (`Arrive`), each release check including the no-release case (`Release`), the condition-only idle check (`Check`), the wait jump and post-wait release, the choice before removal (`Choose`), the removal and recorded answer (`Record`), and the busy push (`Assign`). Pseudocode is 7 lines; displayed Python line numbers (13–21) were checked against each frame.
- Tutorial: `tutorial.js` returns problem-specific reasons and focus per event (for example, release focuses busy and idle only when a server returned; a no-release frame focuses busy alone).
- View: `ServerQueueVisual.jsx` consumes `useTutorialScene()`, renders only focused clock, idle/busy heaps (shared `HeapView`), timeline, or answer, and keeps `TaskSchedulingView` for full mode. Heaps above the shared 48-cell draw limit fall back to candidate text.
- Route: `withProblemStory` wrapper removed so the Story is the movable dock panel, matching 1606.
- Evidence: `algorithm.test.mjs` 3/3 pass (`PYTHON=/usr/local/bin/python3`, Node v24.22.1). Displayed Python agrees with traced results on 158 inputs (all authored presets plus random). A server-render pass covered 670 scenes (full and directed) with zero errors and zero focus mismatches, including a 60-server case and a single-server case. `vite build` (run directly, not `npm run build`, to skip the definition-group regeneration hook) passes.
- Not verified: browser interaction, backward stepping in the live UI, and reduced-motion behaviour (CSS guard added; framer reduced-motion path unchanged).

### Problem 167 — Two Sum II, sorted two pointers (directed)

Exact ID: 167 (`src/problems/Problem167`). The routed view was a legacy component with its own solver and no tutorial wiring; it now uses `AlgorithmWorkspace` with `algorithm.js` (`buildTrace`, `parseInput`), `tutorial.js` (`twoSumTutorial`) and `TwoSumIIVisualizer.jsx`, which consumes `useTutorialScene()`.

- Trace: separate frames for each loop-window test (condition-only), the sum computation, the equality test (condition-only when it fails and nothing moves), the size test, each left or right move (its own frame; the snapshot keeps the compared pair and records the destination), the match result, and the no-match result. Pseudocode and displayed Python line mappings were checked for every frame kind.
- Input: JSON `{"numbers": [...], "target": n}`, 2 to 30 sorted integers; empty, single-element and unsorted input are rejected with messages. Presets come from `config/examples/two-sum-ii.js`.
- View: the window scene renders only the live range [left..right] with real indices through `IndexedSequence`; the comparison scene renders only the two pointed cells and their sum; the full view keeps the complete array and pointer facts.
- Evidence: `algorithm.test.mjs` 6/6 passed with `PYTHON=/usr/local/bin/python3` and the nvm Node 24.22.1 runner. A scratch check (not kept) ran the displayed Python on 411 inputs (authored presets, random sorted arrays, equal pairs, extreme values) and found 0 mismatches with the trace result; every frame's pseudocode and Python line are in range; tutorial output has all five fields; the tutorial sequence has three beats per frame in reason-first mode. `node node_modules/vite/bin/vite.js build` passed.
- Not verified in a browser; backward stepping, reduced motion and the dock layout were not exercised live. The view was not server-rendered.

### Problem 1105 — shelf-partition DP (directed)

Exact ID: 1105 (`src/problems/Problem1105`, Filling Bookcase Shelves). It is a 1-D DP whose cell `dp[end]` reads earlier cells `dp[start-1]`, so the focus shows only the cell being filled and the single cell it reads.

- Trace fixes: the solver emits separate `grow` (width/tallest update), `fit` (condition-only check that the shelf still fits), `stop` (condition-only overflow break), `candidate` (compare `dp[start-1] + tallest` with the best so far, including non-improving candidates) and `improve` frames. Each frame has a `kind` field and a JS/Python line mapping. A `compare` phase was added to `phases`.
- Tutorial: `tutorial.js` authors problem-specific reasons (base case, consecutive last shelf, height as running maximum, width as a hard limit, overflow monotonicity, candidate pricing, keep-the-minimum, final result).
- View: `ShelfTutorial.jsx` consumes the scene through `useTutorialScene()` in `index.jsx`, rendering only the focused prefix cells, the shelf books and a width gauge. Full mode keeps the original DPDependencyView and sequence.
- Evidence: `algorithm.test.mjs` 4/4 pass (`PYTHON=/usr/local/bin/python3`, Node v24.22.1). Displayed Python matched the trace result on 5 custom inputs and all authored presets (`python3 -I` run). Both tutorial modes map every frame to a beat with valid focus cells, and backward traversal was computed for every frame. A Vite SSR render of all 44 focused frames (sample input) produced no errors. `node node_modules/vite/bin/vite.js build` passes.
- Not verified: browser interaction, live backward stepping, reduced-motion behaviour in the UI (inherited from `TutorialScene`), and the file-level Python/JS line highlight in the live dock.

### Problem 1019 — next greater node, monotonic stack (directed)

Exact ID: 1019 (`src/problems/Problem1019`: `algorithm.js`, `tutorial.js`, `NextGreaterVisual.jsx`). Chosen because it is a monotonic stack with an existing solver test file and a routed workspace, and it had no tutorial.

- Trace: pop (`p = stack.pop()`), answer assignment (`answer[p] = v`), push and read are separate frames; each while-test is a `check` frame, including the empty-stack and not-smaller (no pop) cases. Frames copy the stack and answers after each operation. Displayed JS and Python rows were checked against each frame's `activeLine` and `pythonLine`.
- Tutorial: `tutorial.js` returns problem-specific reasons per kind; the check frame is split into empty, pop, and keep reasons.
- View: `NextGreaterVisual.jsx` consumes `useTutorialScene()` and renders only the waiting stack and the position being resolved (the shared `IndexedSequence` is kept for full mode only, because its paged window would still show the whole list in focus). Results show the answers.
- Evidence: `algorithm.test.mjs` 5/5 pass (`PYTHON=/usr/local/bin/python3`, Node v24.22.1), including a new frame-kind test. Displayed Python matches the trace on 157 inputs (7 authored plus 150 generated). Every frame maps to a real displayed code row; `tutorialSequence` gives code and effect beats for each frame, with all scenes having titles, reasons, and focus. A Vite SSR harness rendered 54 focused scenes for `[2,7,4,3,5]` with zero errors and no full-list dashboard in focus. `node node_modules/vite/bin/vite.js build` passed in 20.43 seconds.
- Not verified in a browser: live dock layout, backward stepping in the UI, reduced-motion behaviour (CSS guard added). Empty input is rejected by validation, as the solver requires 1 to 10 values; single-element input is verified.

### Problem 100 — recursive tree comparison, call and return transfers (directed)

Exact ID: 100 (`src/problems/Problem100`: `algorithm.js`, `tutorial.js`, `SameTreeTutorial.jsx`). Trace events were added as real frames: `call` (line 5 left, line 6 right, showing the parent pair and the child pair entered, with null children explicit), `receive` (the child's returned boolean stored as `left_ok` or `right_ok` on the parent pair), and `return` (base case, one-sided, value mismatch and the combined result, each carrying the returned boolean). Condition-only `check` frames never carry a transfer. Answers, example inputs and the displayed Python (left and right evaluated separately) are unchanged. Evidence: `algorithm.test.mjs` 11/11 passed with `PYTHON=/usr/local/bin/python3` and the nvm Node 24.22.1 runner (four new tests covering call child ids, receive booleans, return values and base-case returns); Vite SSR render of every code and reason beat for five custom inputs (including empty versus one-node and sparse trees) with forward and backward sequences equal and call, receive and return content present; `node node_modules/vite/bin/vite.js build` passed in 26.35 seconds. Not verified in a browser: the live transfer animation, reduced motion, and backward stepping in the UI.

### Problem 1207 — unique occurrences, hash-map frequency scan (directed)

Exact ID: 1207 (`src/problems/Problem1207`: `algorithm.js`, `tutorial.js`, `index.jsx`). Chosen because it is a two-pass hash-map frequency count with an existing solver test and no tutorial; Two Sum was excluded.

- Trace: separate frames for each selection, map read, map write, the set initialisation, each count selection, a condition-only `check-free` frame when a count is unclaimed, the claim, the clash return and the result. Each frame has a `kind` and a displayed JS line; the displayed Python agrees with the trace on six inputs including single-element and clash cases.
- Tutorial: `tutorial.js` explains why the first pass must finish before counts are compared, and why reads precede writes.
- View: the focused scene renders only the scanned element, its map entry and the transfer between them (or the claimed-set entry in the second pass); full mode is unchanged.
- Evidence: `algorithm.test.mjs` 5/5 pass (`PYTHON=/usr/local/bin/python3`, Node v24.22.1); a scratch sequence check over six inputs confirmed tutorial fields, line mapping and every frame kind; `node node_modules/vite/bin/vite.js build` passes.
- Not verified in a browser: live dock layout, backward stepping in the UI, and reduced motion.

### Problem 206 — reverse linked list, pointer rewiring (directed)

Exact ID: 206 (`src/problems/Problem206`: `algorithm.js`, `tutorial.js`, `ReverseTutorial.jsx`, `ReverseTutorial.css`, `index.jsx`). It was a legacy self-contained visualizer (`ReverseLinkedListVisualizer.jsx`, now unrouted and left in place) with no algorithm contract; it now uses `AlgorithmWorkspace`.

- Trace: `init` (prev, then curr), a condition-only `check` per loop test (including the final curr = None test), `save` (nxt = curr.next), `rewire` (curr.next = prev, the only pointer write), `move_prev`, `move_curr`, and `result`. Input is a JSON array of 0 to 12 integers. Frame lines 3 to 10 match the 10-line displayed listing, which the test runs as Python.
- Tutorial: `tutorial.js` authors reasons per kind; the save reason explains why nxt is saved before the pointer is overwritten.
- View: `ReverseTutorial.jsx` consumes `useTutorialScene()` and shows only the focused slots (prev, curr, nxt, None as a box). The rewire scene animates one pointer path from the old link (curr to nxt) to the new link (curr to prev) via a `d` transfer.
- Evidence: `algorithm.test.mjs` 7/7 pass with `PYTHON=/usr/local/bin/python3` and the nvm Node 24.22.1 runner (including the displayed Python run on 44 generated lists, the empty and single-node cases, and per-frame tutorial fields). `node node_modules/vite/bin/vite.js build` passes.
- Not verified in a browser: the live transfer animation, reduced motion, backward stepping in the UI, and the dock layout.
