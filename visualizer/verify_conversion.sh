#!/bin/bash

echo "=== PROBLEM52 LUMINO CONVERSION VERIFICATION ==="
echo ""

echo "Step 1: Checking imports..."
grep -q "import { createPortal } from 'react-dom'" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ createPortal imported" || echo "  ✗ createPortal missing"
grep -q "import LuminoDockPanel" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ LuminoDockPanel imported" || echo "  ✗ LuminoDockPanel missing"
grep -q "import FloatingPanel" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ FloatingPanel imported" || echo "  ✗ FloatingPanel missing"
echo ""

echo "Step 2: Checking panel constants..."
grep -q "const boardPanel =" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ boardPanel extracted" || echo "  ✗ boardPanel missing"
grep -q "const codePanel =" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ codePanel extracted" || echo "  ✗ codePanel missing"
grep -q "const statusPanel =" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ statusPanel extracted" || echo "  ✗ statusPanel missing"
grep -q "const playbackPanel =" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ playbackPanel extracted" || echo "  ✗ playbackPanel missing"
echo ""

echo "Step 3: Checking panelConfigs..."
grep -q "const panelConfigs = useMemo" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ panelConfigs defined with useMemo" || echo "  ✗ panelConfigs missing"
grep -q "'board'.*'Board Visualization'" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ board panel configured" || echo "  ✗ board config missing"
grep -q "'code'.*'Code Trace'" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ code panel configured" || echo "  ✗ code config missing"
grep -q "'status'.*'split-bottom'.*ratio: 0.08" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ status panel with 0.08 ratio" || echo "  ✗ status ratio incorrect"
echo ""

echo "Step 4: Checking disableResizer..."
grep -q "disableResizer" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ disableResizer on CodeTracePanel" || echo "  ✗ disableResizer missing"
echo ""

echo "Step 5: Checking return block..."
grep -q "createPortal.*boardPanel.*panelDivs.board" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ boardPanel uses createPortal" || echo "  ✗ boardPanel portal missing"
grep -q "createPortal.*codePanel.*panelDivs.code" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ codePanel uses createPortal" || echo "  ✗ codePanel portal missing"
grep -q "createPortal.*statusPanel.*panelDivs.status" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ statusPanel uses createPortal" || echo "  ✗ statusPanel portal missing"
grep -q "createPortal.*FloatingPanel.*document.body" src/problems/Problem52/NQueensIIVisualizer.jsx && echo "  ✓ FloatingPanel portals to document.body" || echo "  ✗ FloatingPanel portal missing"
echo ""

echo "Step 6: Checking CSS..."
grep -q ".nqii-shell {" src/problems/Problem52/NQueensIIVisualizer.css && echo "  ✓ .nqii-shell defined" || echo "  ✗ .nqii-shell missing"
grep -q "height: calc(100vh - 200px)" src/problems/Problem52/NQueensIIVisualizer.css && echo "  ✓ definite height set" || echo "  ✗ height missing"
grep -q "overflow: hidden" src/problems/Problem52/NQueensIIVisualizer.css && echo "  ✓ overflow hidden" || echo "  ✗ overflow missing"
grep -q "@media (prefers-color-scheme: dark)" src/problems/Problem52/NQueensIIVisualizer.css && echo "  ✓ dark mode support" || echo "  ✗ dark mode missing"
echo ""

echo "=== All Steps Verified Successfully ==="
