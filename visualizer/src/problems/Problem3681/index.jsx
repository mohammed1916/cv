import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'The XOR basis starts empty.' },
    { id: 'insert', label: 'Insert', description: 'Reduce each value by the basis; a surviving value opens a new slot.' },
    { id: 'done', label: 'Complete', description: 'Pick the largest value reachable from the basis.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 2 to 12 integers from 0 to 10^9',
  url: 'https://leetcode.com/problems/maximum-xor-of-subsequences/',
  complexity: 'O(n * bits) for the basis. Every subsequence XOR lies in the span, and the best pair XOR is the largest span element.',
  examples: [
    { label: 'Example 1', input: '[1,2,3]' },
    { label: 'Example 2', input: '[5,2]' },
  ],
}

export default function MaximumXorSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={run.input.indexOf(step.value)} />
    <output aria-label="Best">{step.best === null ? `Inserting ${step.value}` : `Best value in the span: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The XOR of any subsequence is a combination of the values over GF(2), so all subsequence XORs form a linear space.</p>
    <p>Two subsequences can produce any pair of space elements, and their XOR is again in the space. The largest pair XOR is therefore the largest element of the space.</p>
  </>} />
}
