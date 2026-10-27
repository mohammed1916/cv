import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Set the xor limit for the upper bound.' },
    { id: 'count', label: 'Upper bound', description: 'Count pairs whose xor is below high + 1.' },
    { id: 'subtract', label: 'Lower bound', description: 'Count pairs whose xor is below low and subtract.' },
    { id: 'done', label: 'Complete', description: 'Report the pairs in the range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, low and high, for example {"nums":[1,4,2,7],"low":2,"high":6}',
  url: 'https://leetcode.com/problems/count-pairs-with-xor-in-a-range/',
  complexity: 'O(n * B) time and O(n * B) space for B = 7 bits. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4,2,7],"low":2,"high":6}' },
    { label: 'Example 2', input: '{"nums":[9,8,4,2,1],"low":5,"high":14}' },
  ],
}

export default function CountPairsXorRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Pairs counted">{`Pairs with xor below ${step.limit}: ${step.pairs} (${step.label} pass)`}</output>
  </>} renderReasoning={() => <>
    <p>Counting pairs below a limit is easy once the earlier values sit in a trie: at each bit where the limit has a 1, every earlier value that matches the bit so far with a 0 xor is already smaller.</p>
    <p>Pairs with xor in [low, high] are those below high + 1 minus those below low.</p>
  </>} />
}
