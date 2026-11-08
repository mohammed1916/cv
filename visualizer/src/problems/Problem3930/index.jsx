import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3930View from './Problem3930View'
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
  url: 'https://leetcode.com/problems/power-update-after-k-th-largest-insertion-ii/',
  complexity: 'O(q * n) time with sorted-list insertion and O(n) space, for q queries over n elements; the modular power costs O(log x). The visualization caps nums at 8 values and queries at 6. The power uses p raised to x, not an XOR.',
  examples: [
    { label: 'Three queries', input: '{"nums":[4,1,7],"p":2,"queries":[[5,2],[3,1],[9,3]]}' },
    { label: 'Duplicates', input: '{"nums":[],"p":3,"queries":[[2,1],[2,1],[8,2]]}' },
    { label: 'Empty list, one insert', input: '{"nums":[],"p":0,"queries":[[0,1]]}' },
    { label: 'Equal values', input: '{"nums":[5,5],"p":5,"queries":[[5,1],[5,3]]}' },
    { label: 'Full list and largest k', input: '{"nums":[9,9,9,9,9,9,9,9],"p":9,"queries":[[9,9]]}' },
    { label: 'Long run: 8 values, 6 queries', input: '{"nums":[0,9,1,2,3,9,5,4],"p":8,"queries":[[5,3],[5,3],[8,3],[3,4],[0,10],[7,9]]}' },
  ],
}

export default function Problem3930Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3930View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Duplicates count separately, so the k-th largest is read by position in the sorted list, not by distinct value.</p>
  </>} />
}
