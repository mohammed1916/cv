import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no coverage.' },
    { id: 'mark', label: 'Mark', description: 'Each query adds one at its left end and removes one after its right end.' },
    { id: 'check', label: 'Check', description: 'Coverage must reach each value.' },
    { id: 'fail', label: 'Short', description: 'One position is covered fewer times than its value.' },
    { id: 'done', label: 'Complete', description: 'Every position is covered enough.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries (JSON)',
  url: 'https://leetcode.com/problems/zero-array-transformation-i/',
  complexity: 'O(n + q) time and O(n) space. The visualization caps input at 8 values and 6 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,0,1],"queries":[[0,2]]}' },
    { label: 'Example 2', input: '{"nums":[4,3,2,1],"queries":[[1,3],[0,2]]}' },
  ],
}

export default function ZeroArrayOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Coverage" length={run.input.nums.length} valueAt={i => step.cover?.[i] ?? '·'} roleAt={i => `needs ${run.input.nums[i]}`} active={step.index} />
  </>} renderReasoning={() => <>
    <p>Each query may lower any subset of its positions, so each position only needs enough queries covering it.</p>
    <p>A difference array counts coverage in linear time, and the answer is yes exactly when no position is short.</p>
  </>} />
}
