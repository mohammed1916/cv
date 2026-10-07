# Complete LeetCode Problem Visualizer Structure Guide

## Directory Structure

### Location for New Visualizers
```
C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems\{ProblemName}\
```

**Example paths:**
- `src\problems\AddBinary\` (Problem 67)
- `src\problems\AddTwoNumbers\` (Problem 2)
- `src\problems\Problem565\` (for new problems 565+)

### Files in Each Problem Directory
```
src/problems/{ProblemName}/
├── {ProblemName}Visualizer.jsx    (Main component - 400-500 lines typical)
├── {ProblemName}Visualizer.css    (Styling - 200-300 lines)
└── index.jsx                        (Export file - 3 lines)
```

---

## Complete Visualizer Component Pattern

### 1. **index.jsx** (Export File)
```javascript
export const meta = {
  number: '67',           // LeetCode problem number as string
  title: 'Add Binary',    // Full problem title
  slug: 'add-binary',     // Kebab-case slug (used for examples registry)
  difficulty: 'Easy',     // Easy|Medium|Hard
  tags: ['String', 'Math'], // Problem tags
  description: 'Optional: Problem description',
  accent: '#color'        // Optional: Accent color for UI
};
export { default } from './AddBinaryVisualizer';
```

### 2. **{ProblemName}Visualizer.jsx** Structure

#### Imports (Standard Set)
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
import { useSolutionCode } from '../../hooks/useSolutionCode'  // OR useProblemCode
import { getExamples } from '../../config/examplesRegistry'
import './AddBinaryVisualizer.css'
```

#### Step Generator Function
```javascript
function generateSteps(inputParam1, inputParam2, ...) {
  const steps = []
  
  // Initialize state
  let variable1 = ...
  let variable2 = ...
  
  // Push initial step
  steps.push({
    activeLine: 1,        // Code line number highlighted
    variable1,
    variable2,
    result: [],
    // ... other tracked state
    message: 'Initialize state...'
  })
  
  // Main loop/algorithm
  while (...) {
    steps.push({
      activeLine: 3,
      // ... current state at each operation
      message: 'Descriptive step message'
    })
    
    // Perform operation
    // Push step for each meaningful state change
  }
  
  // Final step
  steps.push({
    activeLine: lastLine,
    done: true,
    message: 'Algorithm complete'
  })
  
  return steps
}
```

#### Visualization Component
```javascript
function BinaryVisualization({ a, b, step }) {
  // Receives current step data
  // Renders animated visualization
  // Uses motion.div for animations
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Input display */}
      {/* Current state visualization */}
      {/* Result display */}
      {/* State variable boxes */}
    </div>
  )
}

function VisualizationPanel({ a, b, step, applyEx }) {
  // Wrapper that includes examples section
  return (
    <div>
      {/* Examples buttons */}
      {/* Visualization component */}
    </div>
  )
}
```

#### Main Component
```javascript
export default function AddBinaryVisualizer() {
  // 1. State for inputs
  const [ex, setEx] = useState(EXAMPLES[0] || { a: '11', b: '1' })
  
  // 2. Get solution code
  const SOLUTION_CODE = useSolutionCode('problem-slug')
  
  // 3. Generate steps
  const steps = useMemo(
    () =>
      generateSteps(ex.a, ex.b).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )
  
  // 4. Playback controls
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  
  // 5. Get current step
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  
  // 6. Example application
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  
  // 7. Code-visual connectivity
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })
  
  // 8. Pattern overlay state
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  
  // 9. Dock panels configuration
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
      title: '🔢 Binary Addition',  // Emoji + descriptive title
      content: (
        <VisualizationPanel
          a={ex.a}
          b={ex.b}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  
  // 10. Render
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

## CSS Color Scheme (Catppuccin Mocha)

### Color Variables Used
```css
/* Base colors */
#1e1e2e  - background-main
#252535  - background-secondary
#313244  - border/separator
#45475a  - border-light
#6c7086  - text-muted
#a6adc8  - text-secondary
#cdd6f4  - text-main
#f8fafc  - text-bright

/* Semantic colors */
#89b4fa  - blue (pointer/variable-a)
#f38ba8  - pink/red (pointer/variable-b)
#a6e3a1  - green (success/result)
#f5c2e7  - magenta (carry)
#f59e0b  - amber (carry/emphasis)

/* Dark variants (for backgrounds) */
#001a30  - blue-dark (background for blue elements)
#1a0010  - red-dark (background for red elements)
#001a08  - green-dark (background for green elements)
#1a0015  - magenta-dark (background for magenta elements)
```

### Typical CSS Class Pattern
```css
.ab-bit-box {
  border: 2px solid #45475a;
  background: #252535;
  color: #cdd6f4;
}

.ab-bit-box.active-a {
  border-color: #89b4fa;
  background: #001a30;
  color: #89b4fa;
}

.ab-bit-box.processed {
  border-color: #a6e3a1;
  background: #001a08;
  color: #a6e3a1;
}

.ab-result {
  background: #001a08;
  border: 2px solid #a6e3a1;
  color: #a6e3a1;
}
```

---

## Examples Registry Entry Structure

### Location
`src/config/examplesRegistry.js`

### Example Entry Format
```javascript
"problem-slug": [
  {
    "label": "Example Label 1",
    "param1": "value1",
    "param2": "value2",
    // ... problem-specific fields
  },
  {
    "label": "Example Label 2",
    "param1": "value3",
    "param2": "value4",
  }
]
```

### Real Examples

**Add Binary (Binary String Addition)**
```javascript
"add-binary": [
  {
    "label": "11 + 1",
    "a": "11",
    "b": "1"
  },
  {
    "label": "1010 + 1011",
    "a": "1010",
    "b": "1011"
  },
  {
    "label": "0 + 0",
    "a": "0",
    "b": "0"
  },
  {
    "label": "1111 + 1111",
    "a": "1111",
    "b": "1111"
  },
  {
    "label": "1 + 111",
    "a": "1",
    "b": "111"
  }
]
```

**Add Two Numbers (Linked List Addition)**
```javascript
"add-two-numbers": [
  {
    "label": "Equal Length",
    "l1": [2, 4, 3],
    "l2": [5, 6, 4]
  },
  {
    "label": "Carry",
    "l1": [2, 4, 9],
    "l2": [5, 6, 4]
  },
  {
    "label": "Zeroes",
    "l1": [0],
    "l2": [0]
  },
  {
    "label": "Different Length",
    "l1": [9, 9, 9, 9, 9, 9, 9],
    "l2": [9, 9, 9, 9]
  }
]
```

### Examples Registry Usage
```javascript
// In visualizer component
const EXAMPLES = getExamples('problem-slug')

// In rendering
EXAMPLES.map(e => (
  <button key={e.label} onClick={() => applyEx(e)}>
    {e.label}
  </button>
))
```

---

## Key Patterns & Best Practices

### Step Object Structure
Each step should contain:
```javascript
{
  activeLine: number,           // Code line to highlight
  // ... all current state variables
  message: string,              // User-friendly description
  done?: boolean,               // Optional: marks completion
  relatedLines?: number[]       // Optional: related code lines
}
```

### Animation Approach
- Use `framer-motion` for smooth transitions
- Wrap elements with `<motion.div>`
- Apply `animate={{ scale: 1.1 }}` for emphasis
- Use `initial={{ opacity: 0, y: -10 }}` for entrance

### Layout Structure
1. **DockableWorkspace**: Main two-panel layout (Code + Visualization)
2. **FloatingPanel**: Playback controls (always visible)
3. **PatternOverlay**: Optional pattern visualization overlay

### Styling Approach
- Use Catppuccin Mocha color scheme consistently
- Semantic colors: blue (var A), red (var B), green (result)
- Darker backgrounds for dark theme
- Use motion for interactive elements

### Code Linking
- Connect step changes to code line highlighting
- Use `useCodeVisualConnectivity` hook
- Click code lines to jump to steps
- Shows which code executed at each step

---

## Complete File Checklist

For each new Problem{N} visualizer:
- [ ] `src/problems/Problem{N}/Problem{N}Visualizer.jsx` (400-500 lines)
- [ ] `src/problems/Problem{N}/Problem{N}Visualizer.css` (200-300 lines)
- [ ] `src/problems/Problem{N}/index.jsx` (Export file)
- [ ] Add entry to `src/config/examplesRegistry.js`
- [ ] Register in main routing if needed

---

## Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| Examples not loading | Check `getExamples()` slug matches registry key |
| Code not highlighting | Verify `activeLine` matches actual code line numbers |
| Colors not applying | Use full hex codes, not CSS variables in inline styles |
| Animations not smooth | Ensure step data doesn't mutate, use immutable updates |
| Layout broken | Check DockableWorkspace panel IDs match layout references |

