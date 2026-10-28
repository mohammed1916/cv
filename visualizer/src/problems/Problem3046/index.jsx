import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each value appears.' },
    { id: 'ok', label: 'Fits', description: 'This value can put one copy in each half.' },
    { id: 'fail', label: 'Too many', description: 'This value cannot fit in two distinct halves.' },
    { id: 'done', label: 'Complete', description: 'Report whether the split exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Even-length array of integers 1 to 6 as JSON',
  url: 'https://leetcode.com/problems/split-the-array/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '[1,1,2,2,3,4]' },
    { label: 'Example 2', input: '[1,1,1,1]' },
  ],
}

export default function SplitTheArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (step.value !== null && run.input[i] === step.value ? (step.phase === 'fail' ? 'mismatch' : 'counted') : '')} />
    <output aria-label="Current value">{step.value === null ? `Length ${run.input.length}: each half needs ${run.input.length / 2} distinct values` : `${step.value} appears ${step.count} times`}</output>
  </>} renderReasoning={() => <>
    <p>Each half must hold distinct values, so any value can contribute at most one copy to each half.</p>
    <p>A value with three or more copies cannot be split that way, and two copies always can, so one count check decides the answer.</p>
  </>} />
}
