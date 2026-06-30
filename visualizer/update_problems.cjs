const fs = require('fs');
const path = require('path');

const files = [
  'src/problems/Problem95/Visualizer.jsx',
  'src/problems/Problem96/Visualizer.jsx',
  'src/problems/Problem99/Visualizer.jsx',
];

const PATTERNS = `const PATTERNS = ['complete', 'init', 'process'];

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'process',
  3: 'complete',
};`;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace PatternOverlay import with CodePatternAnnotations and PatternLegend
  content = content.replace(
    "import PatternOverlay from '../../components/PatternOverlay';",
    "import CodePatternAnnotations from '../../components/CodePatternAnnotations';\nimport PatternLegend from '../../components/PatternLegend';"
  );

  // Add PATTERNS and LINE_PATTERN_MAP constants after imports
  content = content.replace(
    /import "\.\/Visualizer\.css";/,
    `import "./Visualizer.css";

${PATTERNS}`
  );

  // Update the hook destructuring
  content = content.replace(
    /const \{ showPattern \} = usePatternOverlay\(\);/,
    "const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();\n  const step = steps[currentStep];"
  );

  // Update the code panel to wrap in relative positioning and add CodePatternAnnotations
  content = content.replace(
    /<FloatingPanel title="Code" icon="[^"]*" dockId="code" defaultWidth="50%">\s*<div style=\{\{padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#64748b'\}\}>Algorithm code here<\/div>\s*<\/FloatingPanel>/,
    `<FloatingPanel title="Code" icon="📝" dockId="code" defaultWidth="50%">
        <div style={{ position: 'relative' }}>
          <div style={{padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#64748b'}}>Algorithm code here</div>
          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
              activeLine={step?.activeLine}
            />
          )}
        </div>
      </FloatingPanel>`
  );

  // Update message display
  content = content.replace(
    /\{steps\[currentStep\]\?\.message\}/g,
    '{step?.message}'
  );

  // Remove the old PatternOverlay rendering and add PatternLegend inside PlaybackControls section
  content = content.replace(
    /\{showPattern && <PatternOverlay \/>\}/,
    ''
  );

  // Add PatternLegend after PlaybackControls
  content = content.replace(
    /<PlaybackControls currentStep=\{currentStep\} totalSteps=\{steps\.length\} \/>\s*<\/div>/,
    `<PlaybackControls currentStep={currentStep} totalSteps={steps.length} />
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
      </div>`
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
});
