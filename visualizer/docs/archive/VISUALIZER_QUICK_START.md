# Quick Start: Creating New Problem Visualizers

## Directory Structure Confirmation

```
C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\
├── AddBinary/
│   ├── AddBinaryVisualizer.jsx
│   ├── AddBinaryVisualizer.css
│   └── index.jsx
├── AddTwoNumbers/
│   ├── AddTwoNumbersVisualizer.jsx
│   ├── AddTwoNumbersVisualizer.css
│   └── index.jsx
├── Problem565/                    ← New visualizers go here
│   ├── Problem565Visualizer.jsx
│   ├── Problem565Visualizer.css
│   └── index.jsx
└── ... (rest of problems)
```

**Absolute Path for New Visualizers:**
```
C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\Problem565\
C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\Problem566\
C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\Problem567\
```

---

## Creation Checklist

### Step 1: Create Directory
```bash
mkdir "C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\Problem565"
```

### Step 2: Create index.jsx
```javascript
// File: src/problems/Problem565/index.jsx
export const meta = {
  number: '565',
  title: 'Array Nesting',
  slug: 'array-nesting',
  difficulty: 'Medium',
  tags: ['Array', 'DFS'],
};
export { default } from './Problem565Visualizer';
```

### Step 3: Create Problem565Visualizer.jsx
- Copy AddBinaryVisualizer.jsx as template
- Replace:
  - `generateSteps()` function with algorithm logic
  - `BinaryVisualization` component with problem-specific visualization
  - `VisualizationPanel` props and data
  - Import statement: change CSS file name
  - Export default name
  - Examples retrieval slug: `getExamples('array-nesting')`

### Step 4: Create Problem565Visualizer.css
- Copy AddBinaryVisualizer.css as template
- Replace:
  - Class prefix `.ab-` with `.p565-` (or similar)
  - Customize colors if needed
  - Keep Catppuccin Mocha color scheme

### Step 5: Add Examples to Registry
File: `src/config/examplesRegistry.js`

```javascript
"array-nesting": [
  {
    "label": "Example 1",
    "arr": [5, 4, 0, 3, 1, 6, 2]
  },
  {
    "label": "Example 2",
    "arr": [1, 0]
  }
]
```

---

## Essential Code Sections

### Step Generator Template
```javascript
function generateSteps(param1, param2) {
  const steps = []
  
  // Initialize state
  let state1 = ...
  let result = []
  
  // Step 1: Initialization
  steps.push({
    activeLine: 1,
    state1,
    result: [...result],
    message: 'Initialize...'
  })
  
  // Loop or algorithm
  while (...) {
    steps.push({
      activeLine: lineNumber,
      state1,
      result: [...result],
      message: 'Step description'
    })
    
    // Update state
    state1 = ...
  }
  
  // Final step
  steps.push({
    activeLine: lastLine,
    done: true,
    result: [...result],
    message: 'Algorithm complete'
  })
  
  return steps
}
```

### Main Component Template
```javascript
export default function Problem565Visualizer() {
  const EXAMPLES = getExamples('array-nesting')
  const [ex, setEx] = useState(EXAMPLES[0] || { /* default */ })
  const SOLUTION_CODE = useSolutionCode('array-nesting')

  const steps = useMemo(() =>
    generateSteps(ex.arr).map(current => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '📊 Array Nesting',
      content: <VisualizationPanel arr={ex.arr} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
```

---

## Catppuccin Mocha Color Palette

**Primary Colors:**
- Background: `#1e1e2e`
- Surface 1: `#313244`
- Surface 2: `#45475a`
- Text: `#cdd6f4`
- Text Muted: `#a6adc8`

**Semantic Colors:**
| Color | Hex | Usage |
|-------|-----|-------|
| Blue | `#89b4fa` | Variable A, Pointer i |
| Red | `#f38ba8` | Variable B, Pointer j |
| Green | `#a6e3a1` | Result, Success |
| Magenta | `#f5c2e7` | Carry, Special |
| Amber | `#f59e0b` | Emphasis, Important |

**Dark Variants (for backgrounds):**
- Blue-dark: `#001a30`
- Red-dark: `#1a0010`
- Green-dark: `#001a08`
- Magenta-dark: `#1a0015`

---

## Common Mistakes & Solutions

| Mistake | Fix |
|---------|-----|
| Examples not loading | Check slug in `getExamples()` matches registry key exactly |
| Code not highlighting | Verify `activeLine` matches actual code line numbers (1-indexed) |
| Animations stuttering | Ensure step state never mutates; use spread operator `[...array]` |
| Layout broken | Check DockableWorkspace panel IDs (`'code'`, `'viz'`) match layout strings |
| Colors look wrong | Use exact hex codes, not CSS variables in inline styles |
| Component not rendering | Verify export is default export in index.jsx |
| Memory leaks | useCallback dependencies should be correct; check connectivity/applyEx |

---

## File Sizes & Structure

**Typical Visualizer:**
- JSX: 400-500 lines
- CSS: 200-300 lines
- index.jsx: 3-5 lines

**Step Object (minimum required fields):**
```javascript
{
  activeLine: number,      // Which code line to highlight
  // ... all state variables
  message: string,         // User-friendly step description
  done?: boolean,          // Optional: marks completion
  relatedLines?: number[]  // Optional: related code lines
}
```

**Example Registry Entry:**
```javascript
"slug": [
  { "label": "Label 1", "param1": value, "param2": value },
  { "label": "Label 2", "param1": value, "param2": value }
]
```

---

## Quick Reference: Import Statements

**Always include these in visualizer:**
```javascript
import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './ProblemNameVisualizer.css'
```

---

## Next Steps

1. Read `VISUALIZER_STRUCTURE_GUIDE.md` for detailed architecture
2. Read `VISUALIZER_CODE_TEMPLATE.md` for complete working example
3. Create new problem directory: `src/problems/Problem565/`
4. Copy and adapt templates for your specific problem
5. Add examples to registry
6. Test with `npm run dev`

