# Catppuccin Mocha Color Scheme - Complete Reference

## Base Colors

```javascript
// Backgrounds
const COLORS = {
  background: '#1e1e2e',      // Main background
  surface1: '#313244',         // Surface with borders
  surface2: '#45475a',         // Lighter surface
  surface3: '#585b70',         // Even lighter
  
  // Text
  text: '#cdd6f4',             // Main text
  textSecondary: '#a6adc8',    // Secondary text
  textTertiary: '#6c7086',     // Tertiary text
  
  // Borders
  border: '#45475a',           // Main border
  borderLight: '#313244',      // Light border
  borderDark: '#1e1e2e',       // Dark border
}
```

---

## Semantic Colors (Catppuccin Flavor)

```javascript
const SEMANTIC = {
  // Blues (Var A, Pointer i)
  blue: '#89b4fa',             // Main blue
  blueDark: '#001a30',         // Dark background
  blueMuted: '#1e40af',        // Muted blue
  
  // Reds (Var B, Pointer j)
  red: '#f38ba8',              // Main red/pink
  redDark: '#1a0010',          // Dark background
  redMuted: '#991b1b',         // Muted red
  
  // Greens (Result, Success)
  green: '#a6e3a1',            // Main green
  greenDark: '#001a08',        // Dark background
  greenMuted: '#047857',       // Muted green
  
  // Magentas (Carry)
  magenta: '#f5c2e7',          // Magenta
  magentaDark: '#1a0015',      // Dark background
  magentaMuted: '#831843',     // Muted magenta
  
  // Amber (Emphasis)
  amber: '#f59e0b',            // Amber
  amberDark: '#78350f',        // Dark amber
  
  // Others
  purple: '#8b5cf6',           // Purple for accents
  cyan: '#0ea5e9',             // Cyan
  yellow: '#f1e000',           // Yellow (rarely used)
}
```

---

## Inline Styling Examples (from AddBinaryVisualizer.jsx)

### Input String Bits

```javascript
// Not highlighted
backgroundColor: '#f1f5f9'
borderColor: '#cbd5e1'
color: '#334155'

// Current (highlighted)
isCurrent ? {
  backgroundColor: '#dbeafe',      // Light blue background
  borderColor: '#0284c7',          // Blue border
  color: '#0c4a6e'                 // Dark blue text
} : null

// Processed
isProcessed ? {
  backgroundColor: '#d1fae5',      // Light green background
  borderColor: '#10b981',          // Green border
  color: '#047857'                 // Dark green text
} : null
```

### Current Calculation Grid

```javascript
// a[i] cell - Blue
<div style={{
  backgroundColor: '#dbeafe',
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ color: '#1e40af' }}>a[i]</div>
  <div style={{ color: '#0c4a6e', fontWeight: 'bold', fontSize: 16 }}>
    {step.a_bit}
  </div>
</div>

// b[j] cell - Red
<div style={{
  backgroundColor: '#fee2e2',
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ color: '#991b1b' }}>b[j]</div>
  <div style={{ color: '#7f1d1d', fontWeight: 'bold', fontSize: 16 }}>
    {step.b_bit}
  </div>
</div>

// carry cell - Magenta
<div style={{
  backgroundColor: '#fce7f3',
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ color: '#831843' }}>carry</div>
  <div style={{ color: '#be185d', fontWeight: 'bold', fontSize: 16 }}>
    {step.carry}
  </div>
</div>

// sum cell - Green
<div style={{
  backgroundColor: '#f0fdf4',
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ color: '#15803d' }}>sum</div>
  <div style={{ color: '#166534', fontWeight: 'bold', fontSize: 16 }}>
    {step.sum ?? '—'}
  </div>
</div>
```

### Result Display

```javascript
<div style={{
  padding: 16,
  backgroundColor: '#ecfdf5',           // Light green background
  borderRadius: 6,
  border: '2px solid #10b981',          // Green border
  fontFamily: 'monospace',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#047857',                     // Dark green text
  letterSpacing: 2,
  textAlign: 'center'
}}>
  {result.length > 0 ? result.join('') : '(building...)'}
</div>
```

### Pointer Display

```javascript
// Pointer i
<div style={{
  padding: 10,
  backgroundColor: '#dbeafe',           // Light blue
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ fontSize: 11, color: '#1e40af' }}>Pointer i</div>
  <div style={{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e'                   // Dark blue
  }}>
    {step?.i ?? -1}
  </div>
</div>

// Pointer j
<div style={{
  padding: 10,
  backgroundColor: '#fee2e2',           // Light red
  borderRadius: 4,
  textAlign: 'center'
}}>
  <div style={{ fontSize: 11, color: '#991b1b' }}>Pointer j</div>
  <div style={{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f1d1d'                   // Dark red
  }}>
    {step?.j ?? -1}
  </div>
</div>
```

---

## CSS Class Examples (from AddBinaryVisualizer.css)

### Bit Boxes

```css
.ab-bit-box {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    border-radius: 6px;
    border: 2px solid #45475a;      /* Dark border */
    background: #252535;             /* Dark background */
    color: #cdd6f4;                  /* Light text */
}

.ab-bit-box.active-a {
    border-color: #89b4fa;           /* Blue border */
    background: #001a30;             /* Dark blue background */
    color: #89b4fa;                  /* Blue text */
}

.ab-bit-box.active-b {
    border-color: #f38ba8;           /* Red border */
    background: #1a0010;             /* Dark red background */
    color: #f38ba8;                  /* Red text */
}

.ab-bit-box.processed {
    border-color: #a6e3a1;           /* Green border */
    background: #001a08;             /* Dark green background */
    color: #a6e3a1;                  /* Green text */
}
```

### Result Box

```css
.ab-result {
    padding: 16px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    background: #001a08;             /* Dark green background */
    border: 2px solid #a6e3a1;       /* Green border */
    color: #a6e3a1;                  /* Green text */
    letter-spacing: 2px;
    text-align: center;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
```

### Calculation Box

```css
.ab-calc-box {
    padding: 12px;
    background: #1e1e2e;             /* Dark background */
    border: 2px solid #8b5cf6;       /* Purple border */
    border-radius: 8px;
    margin: 12px 0;
}

.ab-calc-cell.a-bit {
    border-color: #89b4fa;           /* Blue border */
    background: #001a30;             /* Dark blue background */
}

.ab-calc-cell.b-bit {
    border-color: #f38ba8;           /* Red border */
    background: #1a0010;             /* Dark red background */
}

.ab-calc-cell.carry-bit {
    border-color: #f5c2e7;           /* Magenta border */
    background: #1a0015;             /* Dark magenta background */
}

.ab-calc-cell.sum-bit {
    border-color: #a6e3a1;           /* Green border */
    background: #001a08;             /* Dark green background */
}
```

---

## Color Mapping Table

| Element | Color | Hex | Context |
|---------|-------|-----|---------|
| **Background** | Background | #1e1e2e | Main container |
| **Surface** | Surface 1 | #313244 | Panels, cards |
| **Border** | Border | #45475a | Dividers |
| **Text** | Text Primary | #cdd6f4 | Main content |
| **Text** | Text Secondary | #a6adc8 | Labels, hints |
| **Var A (i)** | Blue | #89b4fa | Active state |
| **Var A BG** | Blue Dark | #001a30 | Background |
| **Var B (j)** | Red | #f38ba8 | Active state |
| **Var B BG** | Red Dark | #1a0010 | Background |
| **Result** | Green | #a6e3a1 | Success |
| **Result BG** | Green Dark | #001a08 | Background |
| **Carry** | Magenta | #f5c2e7 | Special state |
| **Carry BG** | Magenta Dark | #1a0015 | Background |
| **Emphasis** | Purple | #8b5cf6 | Important |

---

## Light Mode Colors (Alternative)

If implementing light mode, use these inverses:

```javascript
const LIGHT_COLORS = {
  background: '#f1f5f9',           // Light gray
  surface1: '#e2e8f0',             // Lighter gray
  text: '#1e293b',                 // Dark text
  border: '#cbd5e1',               // Light border
  
  blue: '#0284c7',                 // Darker blue
  red: '#dc2626',                  // Darker red
  green: '#10b981',                // Darker green
  
  // etc...
}
```

---

## Implementation Notes

### Dark Theme (Current)
- Use hex codes directly in inline styles
- OR use CSS custom properties with fallbacks
- Colors are optimized for dark theme readability

### CSS Variables Approach
```css
:root {
  --bg-main: #1e1e2e;
  --bg-surface: #313244;
  --border: #45475a;
  --text: #cdd6f4;
  --blue: #89b4fa;
  --blue-dark: #001a30;
  --red: #f38ba8;
  --red-dark: #1a0010;
  --green: #a6e3a1;
  --green-dark: #001a08;
}

/* Usage */
.some-class {
  background: var(--bg-main);
  color: var(--text);
  border-color: var(--border);
}
```

### Inline Style Approach (Used in Examples)
```javascript
<div style={{
  backgroundColor: '#1e1e2e',
  color: '#cdd6f4',
  borderColor: '#45475a'
}}>
  {content}
</div>
```

---

## Accessibility Notes

- Contrast ratio for text on dark background is good (7.0+)
- Use bright semantic colors for active states
- Provide text labels in addition to colors
- Don't rely on color alone to convey meaning

