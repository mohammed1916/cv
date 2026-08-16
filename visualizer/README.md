# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## DP-table problems (2D grid/table visualizers)

Problems whose visualizer renders a 2D `dp[i][j]`-style table (rows/cols = string prefixes, substring bounds, or grid positions). Two already have "comparison ray" highlighting showing which prior cell(s) feed the current cell (`above-arrow`/`left-arrow`/`curr-arrow`); the rest do not yet.

Rollout order below is by Problem ID ascending — this is the traversal order for adding comparison-ray visualization to the remaining problems, one at a time with approval before moving to the next. Status column tracks progress; update it as each is completed.

| Order | Problem | Visualizer file | Table meaning | Ray status |
|---|---|---|---|---|
| 1 | Problem5 – Longest Palindromic Substring | `Problem5/PalindromeVisualizer.jsx` | rows/cols = substring start/end indices; dp[i][j] = is-palindrome | **Done** (ray from dp[i+1][j-1] to dp[i][j], green/red by result; ∅=T badge for length-2 steps) |
| 2 | Problem10 – Regular Expression Matching | `Problem10/RegularExpressionMatchingVisualizer.jsx` | rows = text index, cols = pattern index; dp[i][j] = match bool | **Done** (diagonal ray for char/dot; simultaneous zero-occurrence + multi-occurrence rays for `*`, color by outcome) |
| 3 | Problem44 – Wildcard Matching | `Problem44/WildcardMatchingVisualizer.jsx` | rows = string index, cols = pattern index; dp[i][j] = match bool | Missing |
| 4 | Problem62 – Unique Paths | `Problem62/UniquePathsVisualizer.jsx` | rows/cols = grid position; dp[r][c] = path count | **Done** (above/left/curr arrows) |
| 5 | Problem63 – Unique Paths II | `Problem63/UniquePathsIIVisualizer.jsx` | same as above, with obstacles | Missing |
| 6 | Problem64 – Minimum Path Sum | `Problem64/MinimumPathSumVisualizer.jsx` | rows/cols = grid position; dp[r][c] = min path sum | **Done** (above/left/curr arrows) |
| 7 | Problem72 – Edit Distance | `Problem72/EditDistanceVisualizer.jsx` | rows = word1 prefix i, cols = word2 prefix j; dp[i][j] = min edits | Missing |
| 8 | Problem87 – Scramble String | `Problem87/ScrambleStringVisualizer.jsx` | 3D memo (i, j, len) | Missing |
| 9 | Problem97 – Interleaving String | `Problem97/InterleavingStringVisualizer.jsx` | rows/cols = prefixes of s1/s2; dp[i][j] = can-interleave bool | Missing |
| 10 | Problem115 – Distinct Subsequences | `Problem115/DistinctSubsequencesVisualizer.jsx` | rows = t index, cols = s index; dp[i][j] = count | Missing |
| 11 | Problem120 – Triangle | `Problem120/TriangleVisualizer.jsx` | triangular DP; row = level, col = position | Missing |
| 12 | Problem132 – Palindrome Partitioning II | `Problem132/PalindromePartitioningIIVisualizer.jsx` | 2D palindrome-check table + 1D cut-count array | Missing |
| 13 | Problem139 – Word Break | `Problem139/WordBreakVisualizer.jsx` | 1D table (string position → breakable bool) | Missing |
| 14 | Problem140 – Word Break II | `Problem140/WordBreakIIVisualizer.jsx` | 1D memo (position → list of sentences) | Missing |
| 15 | Problem174 – Dungeon Game | `Problem174/DungeonGameVisualizer.jsx` | rows/cols = grid position; dp[r][c] = min health needed | Missing |
| 16 | Problem221 – Maximal Square | `Problem221/MaximalSquareVisualizer.jsx` | rows/cols = matrix position; dp[i][j] = largest square side | Missing |
| 17 | Problem312 – Burst Balloons | `Problem312/BurstBalloonsVisualizer.jsx` | rows/cols = interval bounds (left, right); dp[i][j] = max coins | Missing |
| 18 | Problem322 – Coin Change | `Problem322/CoinChangeVisualizer.jsx` | 1D table (amount → min coins) | Missing |
| 19 | Problem329 – Longest Increasing Path in Matrix | `Problem329/LongestIncreasingPathVisualizer.jsx` | rows/cols = matrix position; dp = longest path from cell | Missing |
| 20 | Problem516 – Longest Palindromic Subsequence | `Problem516/LongestPalindromicSubsequenceVisualizer.jsx` | rows/cols = substring start/end indices; dp[i][j] = LPS length | Missing |
| 21 | Problem568 – Palindrome Subsequence variant | `Problem568/PalindromeSubsequenceVisualizer.jsx` | rows/cols = substring bounds | Missing |
| 22 | Problem583 – Delete Operation for Two Strings | `Problem583/DeleteOperationVisualizer.jsx` | rows/cols = prefixes of word1/word2 | Missing |
| 23 | Problem1143 – Longest Common Subsequence | `Problem1143/LCSVisualizer.jsx` | rows/cols = prefixes of the two strings; dp[i][j] = LCS length | Missing (step data already tracks dp[i-1][j-1]/dp[i-1][j]/dp[i][j-1]) |

**Shared modules for the comparison ray**: `src/hooks/useGridRayOverlay.js` (grid + cell-center measurement via `data-cell="row-col"` attributes, real DOM `getBoundingClientRect()` — no cell-size math, so it's correct for any grid layout/gaps/headers) and `src/components/shared/GridRayOverlay.jsx` (SVG overlay rendering animated lines from a `rays` array of `{key, from, to, color, strokeWidth?}`). N-Queens (Problem51, attacker rays) and Problem5/Problem10 above all use these — extend the ray descriptor shape (not the hook/component signatures) for new needs unless a structurally new capability (curved paths, labels, arrowheads) is required.

Font note: only Problem51 (N-Queens) renders a Unicode chess glyph (♛) with a symbol-font stack; Problem52 (N-Queens II) renders no glyph and isn't affected. No other DP/table problem uses a risky glyph font.
