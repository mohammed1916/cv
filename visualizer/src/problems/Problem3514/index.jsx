import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'values', label: 'Distinct', description: 'Keep each distinct value once.' },
    { id: 'pairs', label: 'Pairs', description: 'Collect every XOR of two distinct values, including zero.' },
    { id: 'triples', label: 'Triples', description: 'XOR each pair value with each value.' },
    { id: 'done', label: 'Complete', description: 'Report the number of distinct triple values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers from 1 to 31 (JSON object with nums)',
  url: 'https://leetcode.com/problems/number-of-unique-xor-triplets-ii/',
  complexity: 'O(d^2 * d) time for d distinct values, with d at most 32 here. The visualization caps the list at 12 entries.',
  examples: [
    { label: 'Three', input: '{"nums":[1,2,3]}' },
    { label: 'Repeats', input: '{"nums":[4,4,7,2]}' },
  ],
}

export default function UniqueXorTripletsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Distinct values" length={step.values.length} valueAt={index => step.values[index]} active={-1} />
    <output aria-label="Pair count">{`Distinct pair XORs: ${step.pairs}`}</output>
    <output aria-label="Triple count">{`Distinct triple XORs: ${step.triples}`}</output>
    <p>{`Input size: ${run.input.nums.length} entries.`}</p>
  </>} renderReasoning={() => <>
    <p>Repeated entries do not add new triple values, so only the distinct values matter. Two values with equal XOR cancel, so pairs and triples can be built from sets.</p>
    <p>Building the pair set first, then XORing each pair with each value, gives every triple value without looping over index triples.</p>
  </>} />
}
