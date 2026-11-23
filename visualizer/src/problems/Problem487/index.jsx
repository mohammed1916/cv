import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'
import { onesTutorial } from './tutorial'
import { examples } from './presets.js'

const phases = [
  { id: 'start', label: 'Start', description: 'Empty window, no zeros.' },
  { id: 'right', label: 'Extend', description: 'Move the right edge forward.' },
  { id: 'zero', label: 'Count zero', description: 'A zero uses up the one flip.' },
  { id: 'shrink', label: 'Shrink', description: 'Move the left edge until one zero remains.' },
  { id: 'best', label: 'Best', description: 'Keep the largest valid window.' },
  { id: 'done', label: 'Result', description: 'Report the best length.' },
]

const goalDiagram = (
  <svg className="goal-diagram" width="360" viewBox="0 0 360 80" role="img" aria-label="Array 1, 1, 0, 1, 1, 0, 1. The window from index 0 to index 4 holds one zero, so its length 5 is the answer.">
    {[1, 1, 0, 1, 1, 0, 1].map((value, index) => <g key={index}>
      <rect x={12 + index * 48} y="18" width="40" height="34" rx="5" style={{ fill: index <= 4 ? 'color-mix(in srgb, var(--primary) 20%, var(--surface2))' : 'var(--surface2)' }} stroke="currentColor" strokeWidth="1.3" />
      <text x={32 + index * 48} y="40" textAnchor="middle" fontSize="14" fill="currentColor">{value}</text>
    </g>)}
    <text x="180" y="72" textAnchor="middle" fontSize="12" fill="currentColor">window length 5 with one zero flipped</text>
  </svg>
)

const definition = {
  number: '487',
  title: 'Max Consecutive Ones II',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  pythonLineMap: Object.fromEntries(code.map(line => [line.line, line.line])),
  inputLabel: 'Object with nums: an array of 0s and 1s (up to 12 entries)',
  url: 'https://leetcode.com/problems/max-consecutive-ones-ii/',
  complexity: 'O(n) time, because each edge moves forward once, and O(1) extra space.',
  question: "Find the longest run of 1s after flipping at most one 0 to 1.",
  approaches: [
    { name: "Sliding window with at most one zero", intuition: "Extend the window on the right. When it holds two zeros, move the left edge until one zero remains, and keep the largest window length.", time: "O(n)", space: "O(1)" },
    { name: "Try each zero", intuition: "Flip each zero in turn, measure the longest run of ones, and keep the best result.", time: "O(n^2)", space: "O(1)" },
  ],
  goal: {
    summary: 'Find the longest run of 1s you can make by flipping at most one 0 to 1.',
    requirement: [
      'nums is a binary array of 0s and 1s.',
      'You may flip at most one 0 to 1. Return the length of the longest run of consecutive 1s after that choice.',
      'If the array has no zeros, the answer is its length.',
      'Input limits used by this visualizer: up to 12 entries.',
    ],
    example: 'In [1, 1, 0, 1, 1, 0, 1], keeping the window from index 0 to index 4 leaves one zero, so flipping it gives five 1s in a row. The answer is 5.',
  },
  goalDiagram,
  tutorial: onesTutorial,
  examples,
}

export default function MaxConsecutiveOnesII() {
  return <AlgorithmWorkspace definition={definition} tutorial={onesTutorial} narration="487" renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={step.nums.length} valueAt={index => step.nums[index]} active={step.right}
      roleAt={index => step.right >= 0 && index >= step.left && index <= step.right ? 'in window' : ''} />
    <output aria-label="Window">{`Window [${step.left}, ${step.right}] · zeros ${step.zeros} · best ${step.best}`}</output>
    {step.phase === 'done' && <output aria-label="Answer">{`Answer ${run.result}`}</output>}
  </>} renderReasoning={() => <>
    <p>A window with at most one zero is exactly a run that can be made all ones by one flip.</p>
  </>} />
}
