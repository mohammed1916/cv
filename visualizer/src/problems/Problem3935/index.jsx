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
    { label: 'Empty list, one insert', input: '{"nums":[],"p":1,"queries":[[1,1]]}' },
    { label: 'Equal values', input: '{"nums":[3,3],"p":3,"queries":[[3,2],[3,1]]}' },
    { label: 'Full list and largest k', input: '{"nums":[9,9,9,9,9,9,9,9],"p":0,"queries":[[0,9]]}' },
    { label: 'Long run: 8 values, 6 queries', input: '{"nums":[1,5,9,3,9,3,5,0],"p":3,"queries":[[0,5],[3,8],[3,8],[8,6],[8,2],[1,5]]}' },
  ],
}

export default function Problem3935Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3935View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each row is one query: insert, read the k-th largest by position, then raise p. The table keeps every step visible.</p>
  </>} />
}
