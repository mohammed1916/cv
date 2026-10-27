import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No index has been seen yet.' },
    { id: 'index', label: 'Index', description: 'Count the good pairs this index forms with earlier indices.' },
    { id: 'done', label: 'Complete', description: 'Subtract the good pairs from all pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with a nums array of integers from 0 to 20, up to 12 entries)',
  url: 'https://leetcode.com/problems/count-number-of-bad-pairs/',
  complexity: 'O(n) expected time with a hash table of keys. The visualization caps the array at 12 entries.',
  examples: [
    { label: 'Official', input: '{"nums":[4,1,3,3]}' },
    { label: 'No bad pairs', input: '{"nums":[1,2,3,4,5]}' },
  ],
}

export default function CountBadPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.nums.length} active={step.index}
      valueAt={index => run.nums[index]}
      roleAt={index => (index < step.index ? `key ${run.nums[index] - index}` : '')} />
    <output aria-label="Key">{step.key === null ? 'key: none' : `key nums[${step.index}] - ${step.index} = ${step.key}`}</output>
    <output aria-label="Status">{`Good pairs so far: ${step.good}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A pair (i, j) is good exactly when nums[i] - i equals nums[j] - j, so good pairs are the pairs that share a key.</p>
    <p>Counting keys as the scan goes gives each index's good pairs in one lookup. The answer is all pairs minus the good ones.</p>
  </>} />
}
