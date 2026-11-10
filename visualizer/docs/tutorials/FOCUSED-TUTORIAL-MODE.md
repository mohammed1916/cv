# Focused teaching mode

First integration: problem 1606, both sorted-list and virtual-key-heap solutions. The shared AlgorithmWorkspace accepts an optional `tutorial({run,step})` adapter. No tutorial switch is shown for problems without authored teaching metadata.

Modes:
- Off: existing complete dock layout, including code and reasoning.
- Step-by-step: focused visuals, actual frame action, current code instruction, relevant variables.
- Reason-first: the same real execution frame, preceded by the need and why this operation addresses it. This is causal explanation, not backward execution.

Changing mode pauses playback without changing the input or frame. The full dock stays mounted while hidden so switching back retains layout and panel state. Stepping backward uses the earlier trace snapshot; no tutorial state mutates solver data.

Adapter contract: return title, reason, action, code (optional), variables (small explicit record), and focus (domain panel IDs). Use TutorialContext in domain components to choose what to show. Transfer endpoints must remain visible. Hide irrelevant panels, not underlying algorithm data. Keep original data identifiers. Never invent an explanation by guessing from a generic variable name.

1606 shows transfer source/destination only, the current request, selected server(s), and current job's timeline. Shared HeapView switches to TutorialHeap inside a tutorial context. It shows operation indices with their neighboring parents/children, preserving original array indices and edges. The camera interpolates its viewBox; arrows measure the highlighted heap node during the camera transition. Hidden node counts and parent-outside-view labels distinguish a focused neighborhood from a complete tree.

Important boundary: current TracedHeap logs may group multiple sift comparisons into one frame. This view explicitly shows the current snapshot AFTER that operation and highlights the involved path. It does not reconstruct false intermediate swaps. To teach individual comparisons, first emit immutable per-comparison heap frames, then drive this same renderer from those frames. Transfer motion runs once on a tutorial transition, not forever. Reduced motion disables camera interpolation and traveling tokens.

Extension example for a hash-based problem:
1. Need: compare the current value with an earlier one later.
2. Choice: remember prior values in a map, with the data needed for the answer (such as original index or frequency).
3. Action: show the actual lookup, key, and result. For counting, explain missing-key initialization before incrementing (e.g. `counts.get(key, 0) + 1`). For Two Sum, look up the complement BEFORE inserting the current item to avoid matching it with itself. These are different rules; do not attach generic map narration to both.

Each additional problem needs a truthful adapter plus focus-aware components. Graphs should retain real node IDs/edges, focus the active node and causal neighbors, explicitly indicate hidden connections, and zoom the camera rather than changing graph semantics. The general graph viewers have NOT been migrated by this change.

Verification: targeted 1606 solver/trace tests, shared heap tests, focused-mode tests. Browser motion and interactive mode-switch acceptance still require a live UI check.
