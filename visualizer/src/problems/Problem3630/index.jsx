import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'A, B and C start empty.' },
    { id: 'element', label: 'Place', description: 'Each value is tried in A, B and C; equal states are kept once.' },
    { id: 'done', label: 'Complete', description: 'Report the best total over all states.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 8 integers',
  url: 'https://leetcode.com/problems/partition-array-for-maximum-xor-and-and/',
  complexity: 'Up to 3^n states in the worst case. Equal states merge, and the official limit is n <= 19.',
  examples: [
    { label: 'Example 1', input: '[2,3]' },
    { label: 'Example 2', input: '[1,3,2]' },
    { label: 'Example 3', input: '[2,3,6,7]' },
  ],
}

export default function PartitionXorAnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index} />
    <output aria-label="States">{`Distinct states: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>The total is XOR(A) + AND(B) + XOR(C), so only three numbers per option matter: the XOR of A, the AND of B, and the XOR of C.</p>
    <p>Keeping the set of reachable triples after each element gives the exact optimum, since two partitions with the same triple score the same.</p>
  </>} />
}
