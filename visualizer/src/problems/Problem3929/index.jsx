import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3929View from './Problem3929View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Only zero parts over zero values is set.' },
    { id: 'cell', label: 'Fill cell', description: 'Find the cheapest last part for this table cell.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest split into k parts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 0 to 9) and k',
  url: 'https://leetcode.com/problems/minimum-partition-score-ii/',
  complexity: 'O(k * n^2) time and O(k * n) space for n values split into k parts, using prefix sums for each part. The visualization caps nums at 9 values.',
  examples: [
    { label: 'Two parts', input: '{"nums":[3,1,4,1,5],"k":2}' },
    { label: 'Equal values', input: '{"nums":[2,2,2,2],"k":3}' },
  ],
}

export default function Problem3929Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3929View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each cell chooses where its last part starts; the cost of a part depends only on its sum, so prefix sums make each choice a subtraction.</p>
  </>} />
}
