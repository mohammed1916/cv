import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'size', label: 'Length', description: 'Read n, the number of entries.' },
    { id: 'grow', label: 'Power of two', description: 'Double a power of two while it stays at most n.' },
    { id: 'done', label: 'Complete', description: 'Report the count of unique triplet values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A permutation of 1 to n (JSON object with nums)',
  url: 'https://leetcode.com/problems/number-of-unique-xor-triplets-i/',
  complexity: 'O(log n) time after reading the input. The visualization caps the permutation at 12 entries.',
  examples: [
    { label: 'Three', input: '{"nums":[1,2,3]}' },
    { label: 'Four', input: '{"nums":[3,1,4,2]}' },
  ],
}

export default function UniqueXorTripletsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Permutation nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={-1} />
    <output aria-label="Power of two">{step.power > 0 ? `Largest power of two at most n: ${step.power}` : 'Not computed yet'}</output>
    <output aria-label="Count">{`Unique XOR triplet values: ${run.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Because nums is a permutation of 1 to n, the XOR triplets cover every value below twice the largest power of two that is at most n.</p>
    <p>For n of at most 2, the values are just the entries themselves, so the count is n.</p>
  </>} />
}
