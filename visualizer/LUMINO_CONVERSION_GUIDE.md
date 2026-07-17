# Quick Lumino Conversion Guide for Haiku

## TL;DR — What to do for each problem

1. **Add imports** (top of file):
   ```jsx
   import { createPortal } from 'react-dom'
   import LuminoDockPanel from '../../components/LuminoDockPanel'
   ```

2. **Remove imports** (if only used for layout):
   ```jsx
   // DELETE: ResizableSplitPanels, VerticalResizableSplitPanels
   ```

3. **Extract panels into consts** (before `return`):
   ```jsx
   const primaryPanel = ( <div className="<prefix>-panel">...</div> )
   const statePanel = ( <div className="<prefix>-panel">...</div> )  // if exists
   const codePanel = (
     <div style={{ position: 'relative', height: '100%' }}>
       <CodeTracePanel
         step={step}
         codeLines={codeLines}
         highlightedLines={connectivity.highlightedLines}
         onLineSelect={connectivity.handleLineSelect}
         onActiveLineDomChange={setActiveLineDom}
         disableResizer  {/* ADD THIS */}
       />
       {showPatternOverlay && <CodePatternAnnotations ... />}
     </div>
   )
   const statusPanel = ( <div className="<prefix>-status ...">...</div> )
   const playbackPanel = (
     <>
       {showPatternOverlay && <PatternLegend ... />}
       <PlaybackControls ... />
     </>
   )
   ```

4. **Add state + config** (right before `return`):
   ```jsx
   const [panelDivs, setPanelDivs] = useState(null)
   const panelConfigs = useMemo(
     () => [
       { id: 'primary', title: '<actual title from panel head>', dockMode: 'split-right' },
       { id: 'state',   title: '<actual title from panel head>', dockMode: 'split-right' }, // omit if no state panel
       { id: 'code',    title: 'Code', dockMode: 'split-bottom' },
       { id: 'status',  title: 'Status', dockMode: 'tab-after' },
     ],
     []
   )
   const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
   ```

5. **Replace `return` block**:
   ```jsx
   return (
     <div className="<prefix>-shell">
       <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
       {panelDivs && (
         <>
           {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
           {panelDivs.state   && createPortal(statePanel,   panelDivs.state)}   {/* omit if no state */}
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

6. **Update CSS** (in `<Name>Visualizer.css`):
   ```css
   .<prefix>-shell {
     position: relative;
     display: flex;
     flex-direction: column;
     height: calc(100vh - 200px);
     min-height: 480px;
     gap: 0;
     overflow: hidden;
   }
   ```
   Delete old: `.rsp`, `.vrsp`, `.-top`, `.-middle` flex rules (but KEEP all `-panel`, `-node`, `-cell` styles).

7. **Test**:
   - `npx vite build` — must pass
   - Dev server: panels visible, tabs draggable, dividers work, minimize button

---

## Problem-Specific Notes

### Problem2 (AddTwoNumbersVisualizer)
- **primary**: `left=` JSX block → "Linked Lists"
- **state**: `right=` JSX block → "State Variables"
- **code**: existing CodeTracePanel block
- **status**: existing `atn-status` div

### Problem3 (LongestSubstringWithoutRepeatingVisualizer)
- **primary**: `lswrc-top` div → "String View"
- **state**: right side of `lswrc-middle` → "Variables"
- **code**: left side of `lswrc-middle` (CodeTracePanel)
- **status**: existing `lswrc-status` div
- Delete: `.lswrc-top`, `.lswrc-middle` flex rules

---

## Key Gotchas

1. **`disableResizer` on CodeTracePanel is MANDATORY** — else internal resizer fights Lumino
2. **Panel IDs must match** — `panelConfigs[i].id` = `panelDivs.<id>` keys
3. **Playback must portal to `document.body`** — not inside the shell
4. **Keep all hooks/state logic unchanged** — layout-only refactor
5. **CSS: definite height on `-shell`** — Lumino can't size against `min-height` ancestors

---

## Batch Process

For 598 problems, the pattern is identical:
1. Identify current layout type (ResizableSplitPanels / flex grid)
2. Extract the 4–5 logical panels
3. Wire up panelConfigs with real panel titles
4. Add the definite-height CSS rule
5. Build + test

Most problems follow the 4-panel pattern (primary/state/code/status).
Some may have only 3 (no separate state). Omit that entry in panelConfigs.
Canvas/grid problems may need special handling — flag if layout doesn't fit the pattern.
