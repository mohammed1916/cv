# Adding Visualization Controls to a New Visualizer

This guide shows how to modularize and extend visualization features to any problem visualizer.

## Quick Start (5 minutes)

### Step 1: Register your visualization features

Edit `src/config/visualizationRegistry.js`:

```javascript
export const VISUALIZATION_REGISTRY = {
  'your-problem-slug': {
    featureId1: {
      icon: '🔢',
      label: 'Feature Label',
      description: 'What this visualization does',
      category: 'dp',           // or 'flow', 'detail', etc.
      enabledByDefault: false,
    },
    featureId2: {
      icon: '📊',
      label: 'Another Feature',
      description: 'Description here',
      category: 'flow',
      enabledByDefault: false,
    },
  },
}
```

### Step 2: Use the hook in your visualizer

```jsx
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import VisualizationControls from '../../components/VisualizationControls'

export default function YourVisualizer() {
  // Get feature definitions from registry
  const featureDefs = getVisualizationFeatures('your-problem-slug')
  
  // Use hook to manage state
  const { items, toggle, enabledIds } = useVisualizationFeatures(featureDefs)
  
  // Now enabledIds tells you which features are enabled
  // Use it to conditionally render panels:
  const panels = [
    ...corepanels,
    ...(enabledIds.includes('dpDetails') ? [dpDetailsPanel] : []),
    ...(enabledIds.includes('edgeFlow') ? [edgeFlowPanel] : []),
  ]
  
  return (
    <div>
      <DockableWorkspace panels={panels} />
      <FloatingPanel>
        <PlaybackControls {...coreProps} />
        <VisualizationControls features={items} onToggle={toggle} />
      </FloatingPanel>
    </div>
  )
}
```

---

## Complete Example: ClimbingStairs

Let's add visualization features to ClimbingStairs visualizer.

### Step 1: Register features

```javascript
// In visualizationRegistry.js, add:
'climbing-stairs': {
  arrayVisualization: {
    icon: '📊',
    label: 'Array States',
    description: 'Show one/two variable values over time',
    category: 'core',
    enabledByDefault: true,
  },
  callStack: {
    icon: '📚',
    label: 'Call Stack',
    description: 'Show function call depth',
    category: 'flow',
    enabledByDefault: false,
  },
  valueFlow: {
    icon: '🔄',
    label: 'Value Flow',
    description: 'Highlight how values propagate',
    category: 'flow',
    enabledByDefault: false,
  },
  stepExplanation: {
    icon: '📝',
    label: 'Step Explanation',
    description: 'Detailed explanation of each step',
    category: 'detail',
    enabledByDefault: false,
  },
}
```

### Step 2: Update visualizer code

```jsx
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import VisualizationControls from '../../components/VisualizationControls'

export default function ClimbingStairsVisualizer() {
  const [nInput, setNInput] = useState('5')
  // ... other state ...

  // Get visualization features
  const featureDefs = getVisualizationFeatures('climbing-stairs')
  const { items, toggle, enabledIds } = useVisualizationFeatures(featureDefs)

  // Build panels based on enabled features
  const dockPanels = [
    {
      id: 'code',
      title: 'Solution Code',
      content: <CodeTracePanel {...codeProps} />,
    },
    {
      id: 'viz',
      title: 'Variable Visualization',
      content: <VariableViz step={step} />,
    },
    // Conditionally add optional panels
    ...(enabledIds.includes('callStack') ? [{
      id: 'stack',
      title: 'Call Stack',
      content: <CallStackPanel step={step} />,
    }] : []),
    ...(enabledIds.includes('valueFlow') ? [{
      id: 'flow',
      title: 'Value Flow',
      content: <ValueFlowPanel step={step} />,
    }] : []),
    ...(enabledIds.includes('stepExplanation') ? [{
      id: 'explanation',
      title: 'Explanation',
      content: <StepExplanation step={step} />,
    }] : []),
  ]

  return (
    <div>
      <DockableWorkspace panels={dockPanels} initialLayout={{...}} />
      <FloatingPanel title="Controls">
        <PlaybackControls {...playbackProps} />
        <VisualizationControls features={items} onToggle={toggle} />
      </FloatingPanel>
    </div>
  )
}
```

---

## Architecture Overview

### Data Flow

```
visualizationRegistry.js (Centralized definitions)
         ↓
useVisualizationFeatures hook (Manages state & sync)
         ↓
VisualizationControls component (UI)
         ↓
ToggleSwitch component (Individual toggle UI)
         ↓
Visualizer component (Consumes enabled feature IDs)
         ↓
DockableWorkspace (Renders conditional panels)
```

### State Management

```
Registry (static config)
    ↓
Hook (state + sync logic)
    ↓
Component (UI representation)
    ↓
Visualizer (Uses enabled IDs to build panels)
```

---

## File Structure

```
src/
├── hooks/
│   └── useVisualizationFeatures.js      ← Reusable hook
├── config/
│   └── visualizationRegistry.js         ← Centralized registry
├── components/
│   ├── VisualizationControls.jsx        ← Main control component
│   └── ToggleSwitch.jsx                 ← Individual toggle
└── problems/
    ├── GameOnGrowingTree/
    │   └── GameOnGrowingTreeVisualizer.jsx
    ├── ClimbingStairs/
    │   └── ClimbingStairsVisualizer.jsx
    └── YourProblem/
        └── YourVisualizer.jsx
```

---

## Reusable Patterns

### Pattern 1: Simple Binary Toggle

```jsx
const { items, toggle, enabledIds } = useVisualizationFeatures(features)
const showPanel = enabledIds.includes('featureId')

return (
  <>
    <VisualizationControls features={items} onToggle={toggle} />
    {showPanel && <MyPanel />}
  </>
)
```

### Pattern 2: Conditional Panel Array

```jsx
const dockPanels = [
  basePanels,
  ...(enabledIds.includes('feature1') ? [panel1] : []),
  ...(enabledIds.includes('feature2') ? [panel2] : []),
]
```

### Pattern 3: Feature-based Rendering

```jsx
const renderOptionalSection = (featureId, component) => 
  enabledIds.includes(featureId) ? component : null
```

### Pattern 4: Group Related Features

```jsx
const dpFeaturesEnabled = ['dpDetails', 'rankHighlight', 'insertBreakdown']
  .some(id => enabledIds.includes(id))

if (dpFeaturesEnabled) {
  // Render DP analysis section
}
```

---

## Best Practices

### 1. Organize by Category

Always assign a `category` to each feature:
- `dp` - Data structure/algorithm analysis
- `flow` - Control flow, value propagation
- `detail` - Detailed explanations, breakdowns
- `core` - Essential for the problem

### 2. Clear Descriptions

Make descriptions specific and action-oriented:
- ✅ "Show parent-child relationships with highlighted edges"
- ❌ "Edge stuff"

### 3. Default State

Set `enabledByDefault` based on importance:
- `true` - For must-have visualizations
- `false` - For optional/advanced features

### 4. Use Emoji Icons

Pick emojis that convey the feature:
- DP/Analysis: 🔢 📊 🧮
- Flow/Movement: 🔗 🔄 ⬆️ ⬇️
- Details: 📝 🔍 ⚖️

### 5. Keep Categories Small

Aim for 2-4 features per category for scannability.

---

## Adding to Existing Visualizers

### GameOnGrowingTree (Already done)
```javascript
// Feature definitions moved to:
VISUALIZATION_REGISTRY['game-on-growing-tree']
```

### ClimbingStairs (Recommended next)
```javascript
// Add features to registry
// Update ClimbingStairsVisualizer.jsx to use hook
// Create optional panels: CallStack, ValueFlow, StepExplanation
```

### Knapsack (Recommended)
```javascript
// Define features:
// - itemSelection (which items contribute to solution)
// - dpTable (show DP table state)
// - recursionTree (show recursive calls)
// - memorization (show memoization cache)
```

### Edit Distance (Recommended)
```javascript
// Define features:
// - dpTable (alignment matrix)
// - alignment (show matching characters)
// - backtracking (path through DP table)
// - substitutions (highlight edit operations)
```

---

## Testing Checklist

For each visualizer you update:

- [ ] Features register in `visualizationRegistry.js`
- [ ] Hook initializes with correct default states
- [ ] VisualizationControls renders all features
- [ ] Each toggle works (checkbox AND text clickable)
- [ ] Toggling on adds panel to DockableWorkspace
- [ ] Toggling off removes panel
- [ ] Categories group correctly in UI
- [ ] Descriptions are accurate
- [ ] Icons match the feature purpose
- [ ] No console errors
- [ ] Mobile-friendly (toggle is tap-able)

---

## Extending Further

### Add Presets (Optional)

```javascript
// In registry:
presets: {
  'full-analysis': ['dpDetails', 'rankHighlight', 'edgeFlow'],
  'beginner': ['arrayVisualization'],
  'advanced': ['valueFlow', 'callStack', 'stepExplanation'],
}
```

### Add Persistence (Optional)

```javascript
// In hook:
const [enabledFeatures, setEnabledFeatures] = useState(() => {
  const stored = localStorage.getItem(`viz-${problemSlug}`)
  return stored ? JSON.parse(stored) : defaults
})

useEffect(() => {
  localStorage.setItem(`viz-${problemSlug}`, JSON.stringify(enabledFeatures))
}, [enabledFeatures, problemSlug])
```

### Add Analytics (Optional)

```javascript
// Track which features users enable
const toggle = useCallback((featureId, enabled) => {
  trackEvent('visualization_toggle', { featureId, enabled, problemSlug })
  setEnabledFeatures(prev => ({ ...prev, [featureId]: enabled }))
}, [problemSlug])
```

---

## Troubleshooting

### "Features not showing up"
1. Check registry has the feature ID
2. Verify `enabledIds` includes the feature
3. Confirm panel is in `dockPanels` array
4. Check DockableWorkspace has the panel

### "Toggle doesn't work"
1. Verify `onToggle` handler is passed correctly
2. Check state updates (React DevTools)
3. Confirm `enabledIds` updates when toggled

### "Panel shows but no content"
1. Check the component passed to panel exists
2. Verify it receives correct props (step, data, etc.)
3. Look for console errors in component

---

## Summary

**Before (scattered, hard to extend):**
```jsx
showDpDetails={showDpDetails}
onShowDpDetailsChange={setShowDpDetails}
dpDetailsLabel="..."
// ... 40+ more scattered props
```

**After (centralized, reusable):**
```jsx
const { items, toggle, enabledIds } = useVisualizationFeatures(
  getVisualizationFeatures('problem-slug')
)
<VisualizationControls features={items} onToggle={toggle} />
```

✅ DRY - Define features once in registry  
✅ Scalable - Add new visualizers in minutes  
✅ Maintainable - Consistent pattern across app  
✅ Professional - Modern toggle UI everywhere  
