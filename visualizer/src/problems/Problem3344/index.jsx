import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OrGridView from './OrGridView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3344',
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the size-one cube.' },
    { id: 'grow', label: 'Grow', description: 'Add the layer for the next size.' },
    { id: 'advance', label: 'Keep', description: 'The next size still fits the limit.' },
    { id: 'stop', label: 'Stop', description: 'The next size is too large.' },
    { id: 'done', label: 'Result', description: 'Report the largest size that fits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (the total sum limit)',
  url: 'https://leetcode.com/problems/maximum-sized-array/',
  complexity: 'O(n^2) time with a running sum of the OR layers, where n is the answer; O(1) extra space. Reading used here: A[i][j][k] = i * (j OR k) over zero-based indices, and the answer counts sizes from 1 upward. The visualization caps s at 5000.',
  examples: [
    { label: 'Small limit', input: '{"s":50}' },
    { label: 'Medium limit', input: '{"s":1000}' },
  ],
}

export default function MaximumSizedArray() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <OrGridView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>Summing i * (j OR k) over all i, j, k splits into the sum of i (n(n-1)/2) times the sum of j OR k over the square. Growing the square adds one row and one column, so each size costs only that layer.</p>
          <p>{step.total == null ? 'No layer has been added yet.' : `Size ${step.next ?? step.n} totals ${step.total} against s = ${step.s}.`}</p>
        </>
      )}
    />
  )
}
