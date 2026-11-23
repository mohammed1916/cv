import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import PrefixChain from '../../components/shared/PrefixChain'
import { buildTrace, parseInput, code, python } from './algorithm'
import { productTutorial } from './tutorial'
import { examples } from './presets.js'

const definition = {
  phases: [
    { id: 'start', label: 'Empty list', description: 'Start with no numbers.' },
    { id: 'add', label: 'Add', description: 'Append a number to the end.' },
    { id: 'query', label: 'Query', description: 'Start the product at one.' },
    { id: 'slice', label: 'Window', description: 'Take the last k numbers.' },
    { id: 'multiply', label: 'Multiply', description: 'Multiply each number of the window into the product.' },
    { id: 'return', label: 'Return', description: 'Return the product.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  pythonLineMap: Object.fromEntries(code.map(line => [line.line, line.line])),
  inputLabel: 'An object with operations: up to 12 entries of ["add", 0-9] or ["getProduct", k]',
  url: 'https://leetcode.com/problems/product-of-the-last-k-numbers/',
  complexity: 'O(k) time per getProduct, because the solution multiplies the last k numbers each time, and O(n) space for the stored numbers. The visualization caps input at 12 operations.',
  question: "Answer queries for the product of the last k numbers added so far.",
  approaches: [
    { name: "Multiply the last k values each query", intuition: "Keep the numbers in a list and multiply the last k entries on each query.", time: "O(k) per query", space: "O(n)" },
    { name: "Prefix products since the last zero", intuition: "Keep running products that restart at each zero. A query becomes one division, or 0 if the window reaches back past a zero.", time: "O(1) per operation", space: "O(n)" },
  ],
  goal: {
    summary: 'Answer each query for the product of the last k added numbers, as the stream grows.',
    requirement: [
      'add(value) appends a number to the stream. Values in this visualizer are the digits 0 to 9.',
      'getProduct(k) returns the product of the last k numbers added so far.',
      'Queries and additions can be mixed, and every answer is reported in order.',
      'Input limits used by this visualizer: up to 12 operations, and 1 ≤ k ≤ the count of numbers added so far.',
    ],
    example: 'Add 2, 4, 3, 5, then ask for the last two numbers. They are 3 and 5, so getProduct(2) returns 15.',
  },
  goalDiagram: (
    <svg className="goal-diagram" width="300" viewBox="0 0 300 100" role="img" aria-label="Stream 2, 4, 3, 5. The last two values, 3 and 5, are the window, and their product is 15.">
      {[2, 4, 3, 5].map((value, index) => <g key={index}>
        <rect x={20 + index * 66} y="30" width="56" height="40" rx="6" style={{fill: index >= 2 ? 'var(--primary)' : 'var(--surface2)'}} stroke="currentColor" strokeWidth="1.5" opacity={index >= 2 ? .35 : 1} />
        <text x={48 + index * 66} y="56" textAnchor="middle" fontSize="14" fill="currentColor">{value}</text>
      </g>)}
      <path d="M 152 20 L 152 12 L 280 12 L 280 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="216" y="8" textAnchor="middle" fontSize="12" fill="currentColor">last 2 → 15</text>
      <text x="150" y="92" textAnchor="middle" fontSize="11" fill="currentColor">3 × 5 = 15</text>
    </svg>
  ),
  tutorial: productTutorial,
  examples,
}

export default function ProductOfLastKNumbers() {
  return <AlgorithmWorkspace definition={definition} tutorial={productTutorial} tutorialModes={['off', 'why']} narration="1352" renderVisual={({ run, step }) => <>
    <IndexedSequence label="numbers" length={step.stream.length} valueAt={index => step.stream[index]} active={step.index}
      roleAt={index => step.window && index >= step.window[0] && index <= step.window[1] ? 'in product' : ''} />
    <PrefixChain values={step.stream} query={step.k !== undefined ? { k: step.k, answer: step.phase === 'return' ? step.product : undefined } : null} />
    <output aria-label="Running product">{step.product !== null && step.product !== undefined ? `Running product: ${step.product}` : 'No product in progress.'}</output>
    <output aria-label="Outputs">{`Outputs: ${step.outputs.length ? step.outputs.join(', ') : '(none yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>The solution keeps every number in arrival order, so the last k numbers are always the last k entries of the list.</p>
    <p>Each query multiplies those k entries together, so a query costs time proportional to k.</p>
  </>} />
}
