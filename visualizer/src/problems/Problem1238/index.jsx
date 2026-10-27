import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'size', label: 'Size', description: 'There are 2^n numbers to place.' },
    { id: 'gray', label: 'Gray code', description: 'Compute the reflected Gray code of the index.' },
    { id: 'append', label: 'Shift by start', description: 'XOR the Gray code with start and append it.' },
    { id: 'done', label: 'Complete', description: 'Report the circular order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n and start with 0 at most start < 2^n (JSON object)',
  url: 'https://leetcode.com/problems/circular-permutation-in-binary-representation/',
  complexity: 'O(2^n) time and space. The visualization caps n at 6.',
  examples: [
    { label: 'Two bits', input: '{"n":2,"start":3}' },
    { label: 'Three bits', input: '{"n":3,"start":2}' },
  ],
}

export default function CircularPermutationBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Circular order" length={run.result.length} valueAt={index => step.answer[index] ?? '-'}
      active={step.index} roleAt={index => (step.answer[index] !== undefined ? 'set' : '')} />
    <output aria-label="Current step">{step.gray !== null
      ? `Gray ${step.gray.toString(2).padStart(run.input.n, '0')} XOR start ${run.input.start}`
      : `Start ${run.input.start}`}</output>
  </>} renderReasoning={() => <>
    <p>The reflected Gray code of 0 to 2^n - 1 changes exactly one bit per step, and wraps from the last value back to 0 with one bit too.</p>
    <p>XOR with start moves the whole cycle so it begins at start; XOR keeps the single-bit differences, so the cycle stays valid.</p>
  </>} />
}
