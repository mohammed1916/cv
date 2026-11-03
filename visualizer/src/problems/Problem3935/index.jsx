import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3935View from './Problem3935View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Sort the starting elements.' },
    { id: 'insert', label: 'Insert', description: 'Place the new value in sorted order.' },
    { id: 'select', label: 'Select', description: 'Read the k-th largest element.' },
    { id: 'power', label: 'Power', description: 'Raise p to that element, modulo 1000000007.' },
    { id: 'done', label: 'Result', description: 'Report p after every query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, p and queries ([value, k] pairs)',
  url: 'https://leetcode.com/problems/power-update-after-k-th-largest-insertion-i/',
  complexity: 'O(q * n) time with sorted-list insertion and O(n) space. This version does not use the note\'s "difference below ten" promise; the same insertion and selection is correct without it. The visualization caps nums at 8 values and queries at 6.',
  examples: [
    { label: 'Small run', input: '{"nums":[6,2],"p":5,"queries":[[1,2],[7,1],[4,3]]}' },
    { label: 'Repeated value', input: '{"nums":[0],"p":4,"queries":[[0,2],[9,1]]}' },
  ],
}

export default function Problem3935Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3935View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each row is one query: insert, read the k-th largest by position, then raise p. The table keeps every step visible.</p>
  </>} />
}
