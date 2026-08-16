import fs from 'fs';
import path from 'path';

const problems = [
  { num: '568', name: 'MaximumVacationDays', slug: 'maximum-vacation-days', difficulty: 'Hard', tags: 'DP', accent: '#ec4899' },
  { num: '569', name: 'MedianSalary', slug: 'median-salary', difficulty: 'Medium', tags: 'SQL', accent: '#f59e0b' },
  { num: '570', name: 'ManagersWith5Reports', slug: 'managers-with-5-reports', difficulty: 'Medium', tags: 'SQL', accent: '#10b981' },
  { num: '571', name: 'FindMedianGivenFrequency', slug: 'find-median-given-frequency', difficulty: 'Hard', tags: 'SQL, Binary Search', accent: '#ef4444' },
  { num: '572', name: 'SubtreeOfAnotherTree', slug: 'subtree-of-another-tree', difficulty: 'Easy', tags: 'Tree, DFS', accent: '#06b6d4' },
  { num: '573', name: 'SquirrelDistribution', slug: 'squirrel-distribution', difficulty: 'Medium', tags: 'Array, Greedy', accent: '#8b5cf6' },
  { num: '574', name: 'WinningCandidate', slug: 'winning-candidate', difficulty: 'Medium', tags: 'SQL', accent: '#f97316' },
  { num: '575', name: 'DistributeCandies', slug: 'distribute-candies', difficulty: 'Easy', tags: 'Array', accent: '#10b981' },
  { num: '576', name: 'OutOfBoundaryPaths', slug: 'out-of-boundary-paths', difficulty: 'Medium', tags: 'DP, DFS', accent: '#ec4899' },
  { num: '577', name: 'EmployeeBonus', slug: 'employee-bonus', difficulty: 'Medium', tags: 'SQL', accent: '#f59e0b' },
  { num: '578', name: 'GetHighestAnswerRate', slug: 'get-highest-answer-rate', difficulty: 'Medium', tags: 'SQL', accent: '#06b6d4' },
  { num: '579', name: 'FindCumulativeSalary', slug: 'find-cumulative-salary', difficulty: 'Medium', tags: 'SQL', accent: '#8b5cf6' },
  { num: '580', name: 'CountStudentNumber', slug: 'count-student-number', difficulty: 'Medium', tags: 'SQL', accent: '#10b981' },
  { num: '581', name: 'ShortestUnsortedContinuousSubarray', slug: 'shortest-unsorted-continuous-subarray', difficulty: 'Easy', tags: 'Array', accent: '#f97316' },
  { num: '582', name: 'KillProcess', slug: 'kill-process', difficulty: 'Medium', tags: 'Tree, Hash', accent: '#ef4444' },
  { num: '583', name: 'DeleteOperationForTwoStrings', slug: 'delete-operation-for-two-strings', difficulty: 'Medium', tags: 'DP, String', accent: '#06b6d4' },
  { num: '584', name: 'FindCustomerReferee', slug: 'find-customer-referee', difficulty: 'Easy', tags: 'SQL', accent: '#f59e0b' },
];

const basePath = 'C:\\Users\\BBBS-AI-01\\d\\cv\\visualizer\\src\\problems';

function generateIndexJsx(num, name, slug, difficulty, tags, accent) {
  return `export const meta = {
  number: "${num}",
  title: "${name.replace(/([A-Z])/g, ' $1').trim()}",
  slug: "${slug}",
  difficulty: "${difficulty}",
  tags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}],
  description: "Trace the algorithm step-by-step with interactive visualization.",
  accent: "${accent}",
};
export { default } from "./${name}Visualizer";
`;
}

function generateVisualizer(num, name, slug) {
  const varName = name.charAt(0).toLowerCase() + name.slice(1);
  return `import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './${name}Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: '# Solution implementation' },
  { line: 2, text: '# Line 2' },
  { line: 3, text: '# Line 3' },
  { line: 4, text: '# Line 4' },
  { line: 5, text: '# Line 5' },
  { line: 6, text: '# Line 6' },
  { line: 7, text: '# Line 7' },
  { line: 8, text: '# Line 8' },
  { line: 9, text: '# Line 9' },
  { line: 10, text: '# Line 10' },
  { line: 11, text: '# Line 11' },
  { line: 12, text: '# Line 12' },
  { line: 13, text: '# Line 13' },
  { line: 14, text: '# Line 14' },
]

const EXAMPLES = getExamples('${slug}')

function generateSteps(input) {
  return [{
    activeLine: 1,
    message: 'Algorithm execution trace',
    relatedLines: [1],
  }]
}

export default function ${name}Visualizer() {
  const [input, setInput] = useState('')
  const [source, setSource] = useState('')
  const [steps, setSteps] = useState([])

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const handleVisualize = useCallback(() => {
    setSource(input)
    setSteps(generateSteps(input))
    setStepIndex(-1)
    setIsPlaying(false)
  }, [input, setIsPlaying, setStepIndex])

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [currentStep]
  )

  return (
    <div className="${varName}-root">
      <div className="${varName}-card ${varName}-input-card">
        <div className="${varName}-input-row">
          <div className="${varName}-field-group">
            <label className="${varName}-input-label">Input</label>
            <input className="${varName}-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter input" />
          </div>
          <button className="${varName}-btn ${varName}-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>
      </div>

      <DockableWorkspace panels={dockPanels}>
        <FloatingPanel>
          <PlaybackControls isPlaying={isPlaying} onPlayToggle={togglePlay} onStepForward={stepForward} onStepBack={stepBack} onReset={handleReset} speed={speed} onSpeedChange={setSpeed} currentStep={stepIndex + 1} totalSteps={steps.length} />
        </FloatingPanel>
      </DockableWorkspace>

      {showPatternOverlay && <PatternOverlay activeLineDom={activeLineDom} />}
    </div>
  )
}
`;
}

function generateCss(varName, accent) {
  return `.${varName}-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
}

.${varName}-card {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 12px;
  padding: 1.35rem 1.45rem;
}

.${varName}-input-card {
  border-color: rgba(${hexToRgb(accent).join(',')}, 0.16);
}

.${varName}-input-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.${varName}-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  flex: 1;
  min-width: 200px;
}

.${varName}-input-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #a6adc8;
}

.${varName}-input {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  color: #cdd6f4;
}

.${varName}-input:focus {
  outline: none;
  border-color: ${accent};
  box-shadow: 0 0 8px rgba(${hexToRgb(accent).join(',')}, 0.15);
}

.${varName}-btn {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.${varName}-btn-primary {
  background: ${accent};
  color: #1e1e2e;
  font-weight: 500;
}

.${varName}-btn-primary:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}
`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

// Generate all files
problems.forEach((problem) => {
  const dir = path.join(basePath, `Problem${problem.num}`);

  // Create index.jsx
  fs.writeFileSync(
    path.join(dir, 'index.jsx'),
    generateIndexJsx(problem.num, problem.name, problem.slug, problem.difficulty, problem.tags, problem.accent),
    'utf8'
  );

  // Create Visualizer.jsx
  fs.writeFileSync(
    path.join(dir, `${problem.name}Visualizer.jsx`),
    generateVisualizer(problem.num, problem.name, problem.slug),
    'utf8'
  );

  // Create Visualizer.css
  const varName = problem.name.charAt(0).toLowerCase() + problem.name.slice(1);
  fs.writeFileSync(
    path.join(dir, `${problem.name}Visualizer.css`),
    generateCss(varName, problem.accent),
    'utf8'
  );

  console.log(`✓ Problem${problem.num}: ${problem.name}`);
});

console.log('\\nBatch 7 visualizers generated successfully!');
