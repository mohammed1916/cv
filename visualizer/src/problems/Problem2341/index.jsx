import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is waiting yet.' },
    { id: 'wait', label: 'Wait', description: 'No waiting value matches, so this one waits.' },
    { id: 'pair', label: 'Pair', description: 'A waiting value matches, so both leave the waiting set.' },
    { id: 'done', label: 'Complete', description: 'Report pairs and leftover.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 0 to 20 as a JSON array',
  url: 'https://leetcode.com/problems/maximum-number-of-pairs-in-array/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '[1,3,2,1,3,2,2]' },
    { label: 'Example 2', input: '[1,1]' },
    { label: 'Example 3', input: '[0]' },
  ],
}

export default function MaximumNumberOfPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (i < step.index ? 'seen' : '')} />
    <output aria-label="Waiting values">{`Waiting: [${step.waiting.join(', ')}] · Pairs: ${step.pairs}`}</output>
  </>} renderReasoning={() => <>
    <p>Two equal values can always be paired, and a value only needs one partner, so a waiting set that toggles is enough.</p>
    <p>Each value is either paired with an earlier waiting copy or waits itself, so the waiting set at the end is the leftover.</p>
  </>} />
}
