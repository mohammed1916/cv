import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count occurrences and order values by absolute value.' },
    { id: 'skip', label: 'Zero', description: 'Zeros are handled by parity.' },
    { id: 'pair', label: 'Pair', description: 'Consume copies of x together with copies of 2x.' },
    { id: 'fail', label: 'Fail', description: 'Not enough doubles available.' },
    { id: 'done', label: 'Complete', description: 'Return whether all values were paired.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array arr (JSON, even length)',
  url: 'https://leetcode.com/problems/array-of-doubled-pairs/',
  complexity: 'O(n log n) time, O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '[3,1,3,6]' },
    { label: 'Example 2', input: '[2,1,2,6]' },
    { label: 'Example 3', input: '[4,-2,2,-4]' },
  ],
}

export default function ArrayOfDoubledPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original array" length={run.input.length} valueAt={i => run.input[i]} />
    <IndexedSequence label="Distinct values by |x|" length={step.keys.length} active={step.index} valueAt={i => step.keys[i]} roleAt={i => i === step.target ? 'right' : ''} />
    <IndexedSequence label="Remaining count of each value" length={step.keys.length} active={step.index} valueAt={i => step.counts[i]} roleAt={i => i === step.target ? 'right' : ''} />
  </>} renderReasoning={() => <>
    <p>The element with the smallest absolute value can only be the smaller half of a pair, since halving it would give a still smaller absolute value. So it must be paired with its double.</p>
    <p>Greedy by absolute value is therefore forced: all copies of x consume copies of 2x, then 2x continues with what is left. Zero doubles to itself, so its count must be even.</p>
  </>} />
}
