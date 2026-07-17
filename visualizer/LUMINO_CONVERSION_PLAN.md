# Lumino Dock Layout — Per-Problem Conversion Plan

Goal: convert each problem visualizer from its current layout
(`ResizableSplitPanels` / `VerticalResizableSplitPanels` / plain flex `<div>` grid)
to the shared **`LuminoDockPanel`** used by Problem1 (TwoSum). Playback stays in a
`FloatingPanel` portaled to `document.body`.

The reference implementation is **Problem1** (`src/problems/Problem1/TwoSumVisualizer.jsx`
+ `TwoSumVisualizer.css`) and `src/components/LuminoDockPanel.jsx`. Read those first.

---

## 0. Prerequisites (already done — do NOT recreate)

- `src/components/LuminoDockPanel.jsx` + `.css` exist and work. Reuse as-is.
- `CodeTracePanel` supports a `disableResizer` prop — pass it so Lumino owns
  scroll/resize instead of the panel's internal resizer.
- `@lumino/widgets` + `@lumino/messaging` are installed.

Do not modify LuminoDockPanel or CodeTracePanel. Only edit the per-problem
`<Name>Visualizer.jsx` and its `.css`.

---

## 1. Identify the panels in the current visualizer

Every visualizer has these logical pieces (names/prefixes vary per problem — e.g.
`atn-`, `lswrc-`, `twosum-`). Find them in the current JSX:

| Logical panel | How to find it | dockMode to use |
|---|---|---|
| **Primary visual** (array/list/string/tree view) | the first big `<div className="<prefix>-panel">` or `left=` of a split | first panel (no mode) |
| **Secondary/state** (variables, hash map, etc.) | second panel, or `right=` of a split | `split-right` |
| **Code** | the `<CodeTracePanel .../>` block (often wrapped in a `position:relative` div with `CodePatternAnnotations`) | `split-bottom` |
| **Status** | the `<div className="<prefix>-status">` message line | `tab-after` (tabs with Code) |
| **Playback** | the `<PlaybackControls .../>` (+ optional `PatternLegend`) | stays in FloatingPanel — NOT a dock panel |

Some problems have only 3 logical panels (no separate secondary/state). That's
fine — just omit that entry from `panelConfigs`.

---

## 2. Edit the Visualizer JSX — steps

### 2a. Imports
- ADD: `import { createPortal } from 'react-dom'` (if not already imported)
- ADD: `import LuminoDockPanel from '../../components/LuminoDockPanel'`
- KEEP: `FloatingPanel` import (still used for playback)
- REMOVE: `ResizableSplitPanels`, `VerticalResizableSplitPanels` imports IF no
  longer referenced after the edit.
- Ensure `useState`, `useCallback`, `useMemo` are imported (add `useMemo` if missing).

### 2b. Extract each panel's JSX into a named `const` above the `return`
Convert the inline panel markup into variables, e.g.:
```jsx
const primaryPanel = ( <div className="<prefix>-panel"> ...existing left/first panel JSX... </div> )
const statePanel   = ( <div className="<prefix>-panel"> ...existing right/second panel JSX... </div> )  // if present
const codePanel = (
  <div style={{ position: 'relative', height: '100%' }}>
    <CodeTracePanel
      step={step}
      codeLines={/* same as before */}
      highlightedLines={/* same */}
      onLineSelect={/* same */}
      onActiveLineDomChange={setActiveLineDom}
      disableResizer            {/* ADD THIS */}
    />
    {showPatternOverlay && (
      <CodePatternAnnotations ...same as before />
    )}
  </div>
)
const statusPanel = (
  <div className="<prefix>-status ...same classes...">
    {step?.message ?? 'Press Play or Step to begin.'}
  </div>
)
const playbackPanel = (
  <>
    {showPatternOverlay && (
      <PatternLegend currentPhase={step?.phase} usedPatterns={<PREFIX>_PATTERNS} />
    )}
    <PlaybackControls ...all existing props unchanged... />
  </>
)
```
IMPORTANT: copy the existing prop values / conditionals exactly. Only ADD
`disableResizer` to CodeTracePanel. Do not change step logic, hooks, or handlers.

### 2c. Add panelConfigs + panelDivs state (just above `return`)
```jsx
const [panelDivs, setPanelDivs] = useState(null)
const panelConfigs = useMemo(
  () => [
    { id: 'primary', title: '<Primary panel title>', dockMode: 'split-right' },
    { id: 'state',   title: '<State panel title>',   dockMode: 'split-right' }, // omit if no state panel
    { id: 'code',    title: 'Code',                  dockMode: 'split-bottom' },
    { id: 'status',  title: 'Status',                dockMode: 'tab-after' },
  ],
  []
)
const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
```
Use the panel's real head/title text for `title` (e.g. 'Linked Lists', 'String View').

### 2d. Replace the entire `return ( ... )` body
```jsx
return (
  <div className="<prefix>-shell">
    <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
    {panelDivs && (
      <>
        {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
        {panelDivs.state   && createPortal(statePanel,   panelDivs.state)}   {/* omit if no state panel */}
        {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
        {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
      </>
    )}
    {createPortal(
      <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
      document.body
    )}
  </div>
)
```
The `id`s in `panelConfigs` MUST match the `panelDivs.<id>` keys used here.

---

## 3. Edit the Visualizer CSS

In `<Name>Visualizer.css`, replace the `-shell` rule so the Lumino container
has a definite height (Lumino cannot size against `min-height`-only ancestors):

```css
.<prefix>-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);   /* definite height for the absolute Lumino container */
  min-height: 480px;
  gap: 0;
  overflow: hidden;
}
```

- Delete any old `.<prefix>-shell > .rsp` / `.vrsp` / `-top` / `-middle` flex rules
  that positioned the old split layout (they're now unused). Leave all the
  inner panel styles (`-panel`, `-node`, `-cell`, `-status`, etc.) untouched —
  they still style the portaled content.

---

## 4. Verify

1. `npm run build` (or `npx vite build`) — must succeed with no errors.
2. Open the problem in the dev server. Confirm:
   - All panels render with visible content and real height (not 0px).
   - Draggable tabs appear at the top of each panel.
   - Dividers are visible; dragging them resizes.
   - The minimize (—) button collapses a panel to its title strip.
   - Playback Controls float bottom-center with the pin/collapse title bar.
   - Play / Step / Reset still work; active code line highlights.

---

## 5. Gotchas (learned from Problem1)

- **Do NOT** wrap panel content in extra `position:absolute` — Lumino handles it.
- CodeTracePanel MUST get `disableResizer`, else its internal resizer + fixed
  height fight Lumino's scroll.
- Playback MUST be `createPortal(..., document.body)` — a `transform: scale()`
  ancestor (`#zoom-content-wrapper`) breaks `position:fixed` otherwise.
- Panel `id`s in `panelConfigs` and `panelDivs.<id>` must match exactly.
- Keep all hooks, `generateSteps`, `usePlaybackState`, connectivity, and pattern
  overlay logic EXACTLY as-is. This is a layout-only refactor.
- If a problem has extra panels (3+ visual panels), add more entries to
  `panelConfigs` with appropriate `dockMode` (`split-right` / `split-bottom`).

---

## 6. Two worked reference points

- **Problem1** (`TwoSumVisualizer.jsx`): the finished target. Copy its shape.
- **Problem2** (`AddTwoNumbersVisualizer.jsx`): currently `ResizableSplitPanels`
  with `left=` (Linked Lists) / `right=` (State Variables) + CodeTrace + `atn-status`
  + FloatingPanel. Maps to: primary='Linked Lists', state='State Variables',
  code='Code', status='Status'.
- **Problem3** (`LongestSubstringWithoutRepeatingVisualizer.jsx`): plain flex grid
  (`lswrc-top` String View, `lswrc-middle` = CodeTrace + Variables panel,
  `lswrc-status`) + FloatingPanel. Maps to: primary='String View',
  state='Variables', code='Code', status='Status'.
