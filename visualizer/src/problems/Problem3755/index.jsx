import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has key (0, 0).' },
    { id: 'record', label: 'Record', description: 'Remember the first prefix with this key.' },
    { id: 'match', label: 'Match', description: 'A repeated key marks a balanced subarray.' },
    { id: 'done', label: 'Complete', description: 'Report the longest balanced subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of non-negative integers, for example {"nums":[3,1,3,2,0]}',
  url: 'https://leetcode.com/problems/find-maximum-balanced-xor-subarray-length/',
  complexity: 'O(n) expected time with a hash map. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,3,2,0]}' },
    { label: 'Example 3', input: '{"nums":[0]}' },
  ],
}

export default function BalancedXorLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Key">{`Key (XOR, balance): ${step.key || '(none)'}. Best length: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray between prefix positions a and b is balanced when the two prefixes have the same XOR and the same even-minus-odd balance.</p>
    <p>Storing the first position of each (XOR, balance) pair turns every repeat into a candidate length.</p>
  </>} />
}
