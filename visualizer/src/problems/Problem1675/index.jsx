import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Make even', description: 'Double every odd number so each value can be halved.' },
    { id: 'measure', label: 'Measure', description: 'Record the largest minus the smallest.' },
    { id: 'halve', label: 'Halve', description: 'Halve the largest value to shrink the spread.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest deviation found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...]} with 2 to 8 values from 1 to 20',
  url: 'https://leetcode.com/problems/minimize-deviation-in-array/',
  complexity: 'O(n log n + n log M) time with a max heap, where M is the largest value. The visualization caps input at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4]}' },
    { label: 'Example 2', input: '{"nums":[4,1,5,20,3]}' },
  ],
}

export default function MinimizeDeviation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Values now" length={step.values.length} valueAt={i => step.values[i]} active={step.picked} />
    <output aria-label="Best deviation">{`Best deviation so far: ${Number.isFinite(step.best) ? step.best : 'none yet'}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A value that is odd cannot be halved, so the start doubles it. Every value then only moves down, and the largest one is the only one whose halving can reduce the spread.</p>
    <p>The loop stops at the first odd largest value, because nothing can lower it further.</p>
  </>} />
}
