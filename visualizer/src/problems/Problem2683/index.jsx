import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of zero.' },
    { id: 'fold', label: 'Fold in', description: 'Xor each derived bit into the total.' },
    { id: 'done', label: 'Complete', description: 'Decide whether a binary original exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with derived (0 and 1), for example {"derived":[1,1,0]}',
  url: 'https://leetcode.com/problems/neighboring-bitwise-xor/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"derived":[1,1]}' },
    { label: 'Example 2', input: '{"derived":[1,0]}' },
  ],
}

export default function NeighboringBitwiseXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Derived bits" length={run.input.derived.length} valueAt={i => run.input.derived[i]} active={step.index} roleAt={i => (i < step.index ? 'folded' : '')} />
    <output aria-label="Total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Every original bit appears in exactly two derived values, once as a left neighbor and once as a right neighbor. Xoring the derived array therefore cancels every original bit.</p>
    <p>The total is 0 exactly when a consistent circular original exists, and choosing the first original bit determines the rest.</p>
  </>} />
}
