# Dedicated visualizer recovery audit — 2026-11-05

## Confirmed and restored: 1096 Brace Expansion II

Commit `13cabeffeb73ea936ab9aedbe5cd06a06e9a6055` replaced the route entry with an inline AlgorithmWorkspace view. The dedicated `BraceExpansionIIVisualizer.jsx`, styles, narrative, RecursiveCallTree and CartesianExpansion components were still present. The entry now exports the dedicated renderer again; the newer algorithm.js and algorithm tests remain intact.

Validation: 11 tests pass, including six dedicated preset traces, recursive call snapshots, Cartesian operands/results and a route regression guard. Production Vite build passes. Browser results are recorded below after the smoke check. The generic parser's 20-character cap differs from the dedicated view's 60-character limit; dedicated preset results were compared directly against buildTrace without applying that unrelated parser limit.

## Other restoration candidates

Static scan found 45 folders (including restored 1096) with an AlgorithmWorkspace entry and a sibling *Visualizer.jsx not named by that entry. This is a candidate list, not proof that each old view is better or fully functional; indirect imports may also produce candidates. It does not cover all family-route replacements or deleted files.

Restore selectively: inspect Git history and current dependencies, retain newer algorithm fixes/tests, check original authored presets and real teaching frames, then verify routed playback. Do not reset whole folders or bulk-export every candidate. Shared modules should be reconnected through their consumers where intact, rather than rolled back globally.

| Problem | Preserved renderer | Shared components imported |
|---|---|---|
| 10 | `src/problems/Problem10/RegularExpressionMatchingVisualizer.jsx` | FloatingPanel, GridRayOverlay, ManualInputPanel |
| 14 | `src/problems/Problem14/LongestCommonPrefixVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 15 | `src/problems/Problem15/ThreeSumVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 16 | `src/problems/Problem16/ThreeSumClosestVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 29 | `src/problems/Problem29/DivideTwoIntegersVisualizer.jsx` | FloatingPanel |
| 31 | `src/problems/Problem31/NextPermutationVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 47 | `src/problems/Problem47/PermutationsIIVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 105 | `src/problems/Problem105/ConstructBTVisualizer.jsx` | FloatingPanel, ManualInputPanel, ReconstructionStory, StoryPanel, reconstructTreeStory |
| 106 | `src/problems/Problem106/ConstructBinaryTreeFromInorderAndPostorderTraversalVisualizer.jsx` | FloatingPanel, ManualInputPanel, ReconstructionStory, reconstructTreeStory |
| 116 | `src/problems/Problem116/PopulatingNextRightPointersVisualizer.jsx` | NextPointersWorkspace |
| 118 | `src/problems/Problem118/PascalsTriangleVisualizer.jsx` | PascalWorkspace |
| 120 | `src/problems/Problem120/TriangleVisualizer.jsx` | AlgorithmStoryWorkspace |
| 126 | `src/problems/Problem126/WordLadderIIVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 143 | `src/problems/Problem143/ReorderListVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 144 | `src/problems/Problem144/BinaryTreePreorderTraversalVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 145 | `src/problems/Problem145/BinaryTreePostorderTraversalVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 146 | `src/problems/Problem146/LRUCacheVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 147 | `src/problems/Problem147/InsertionSortListVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 149 | `src/problems/Problem149/MaxPointsOnALineVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 150 | `src/problems/Problem150/EvalRPNVisualizer.jsx` | FloatingPanel |
| 151 | `src/problems/Problem151/ReverseWordsInAStringVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 152 | `src/problems/Problem152/MaxProductSubarrayVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 153 | `src/problems/Problem153/FindMinRotatedVisualizer.jsx` | FloatingPanel |
| 154 | `src/problems/Problem154/FindMinimumInRotatedSortedArrayIIVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 155 | `src/problems/Problem155/MinStackVisualizer.jsx` | FloatingPanel |
| 156 | `src/problems/Problem156/BinaryTreeUpsideDownVisualizer.jsx` | FloatingPanel |
| 157 | `src/problems/Problem157/ReadNCharactersGivenRead4Visualizer.jsx` | FloatingPanel, ManualInputPanel |
| 158 | `src/problems/Problem158/ReadNCharactersGivenRead4IIVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 159 | `src/problems/Problem159/LongestSubstringWithAtMostTwoDistinctCharactersVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 160 | `src/problems/Problem160/IntersectionTwoLinkedListsVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 161 | `src/problems/Problem161/OneEditDistanceVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 162 | `src/problems/Problem162/FindPeakElementVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 163 | `src/problems/Problem163/MissingRangesVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 164 | `src/problems/Problem164/MaximumGapVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 165 | `src/problems/Problem165/CompareVersionNumbersVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 166 | `src/problems/Problem166/FractionToRecurringDecimalVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 167 | `src/problems/Problem167/TwoSumIIVisualizer.jsx` | FloatingPanel, ManualInputPanel |
| 168 | `src/problems/Problem168/ExcelSheetColumnTitleVisualizer.jsx` | FloatingPanel |
| 169 | `src/problems/Problem169/MajorityElementVisualizer.jsx` | FloatingPanel |
| 432 | `src/problems/Problem432/Problem432Visualizer.jsx` | FloatingPanel, ManualInputPanel |
| 1036 | `src/problems/Problem1036/EscapeALargeMazeVisualizer.jsx` | FloatingPanel, VisualizerDockLayout |
| 1096 (restored) | `src/problems/Problem1096/BraceExpansionIIVisualizer.jsx` | AlgorithmNarrative, CartesianExpansion, FloatingPanel, PointerRail, RecursiveCallTree |
| 1143 | `src/problems/Problem1143/LCSVisualizer.jsx` | FloatingPanel |
| 1307 | `src/problems/Problem1307/Problem1307Visualizer.jsx` | FloatingPanel, ManualInputPanel |
| 2333 | `src/problems/Problem2333/MinimumSumofSquaredDifferenceVisualizer.jsx` | AlgorithmNarrative, FloatingPanel, PointerRail |

## Browser smoke result

Native Chrome on localhost:3010/#brace-expansion-ii loaded the restored dedicated view. Observed Code Trace, Expression Expansion and Recursive Parser panels, an active return frame at Python line 26, the nested call tree with three calls, the cursor at position 10, and union/product values matching the narrative. Playback controls were visible with Pause active. This establishes routed rendering and a real playback frame, not exhaustive interaction or all-preset browser acceptance. The user changed the browser during the attempted pause, so no further actions were sent.

## Preservation rule for follow-up work

The dedicated 1096 renderer is intentional. Keep its tree, Cartesian expansion, pointer rail and narrative when adding algorithm contracts or language support. Do not replace it with a generic view solely to satisfy solver-contract coverage. `dedicatedView.test.mjs` guards the entry point and its real trace data.


## Selected-list restoration completed — 2026-11-06

The user explicitly selected this list for recovery. All 45 entries above now export their existing dedicated visualizer, retaining newer algorithm modules and tests. No other problem routes were restored. `src/data/dedicatedVisualizerRecovery.json` records the selected scope, and its adjacent regression test guards all 45 entry points.

Validation: production build passes; 229 selected solver/shared-model tests pass (the two Python subprocess checks were rerun with PYTHON=python3 because this Mac has no `python` executable). An isolated React DOM check using Vite SSR module loading and jsdom mounted all 45 dedicated views and clicked Next three times in each; all changed rendered content without runtime errors. Providers matched the app (Zoom, Visualization and Chat). This is component-interaction evidence, not visual/browser acceptance. Triangle's dedicated scene and narrative also loaded in native Chrome. Further browser interactions were interrupted by user activity; the user subsequently explicitly requested no visual checks.

Light mode: selected legacy styles and inline colours now use scoped compatibility tokens for readable foregrounds and theme surfaces; original colours remain fallbacks in dark mode. Added missing surface1 alias used by Triangle. Prerequisite handle now has an opaque backing rail and two decorative nested curved bands; the label, map content and drag handlers are retained.

Final code-only theme checks: light and dark semantic token contrast checks pass. Fixed five light code-token contrast failures and added the missing primary-contrast token. 45 route-regression tests pass. No visual checks were performed after the user requested code-only fixes.
