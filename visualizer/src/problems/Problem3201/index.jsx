import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count parity', description: 'Count the even and odd values.' },
    { id: 'switch', label: 'Parity switch', description: 'Neighbours differ in parity, so the alternating run grows.' },
    { id: 'same', label: 'Same parity', description: 'Neighbours share parity, so the alternating run stops growing here.' },
    { id: 'done', label: 'Complete', description: 'Report the best of the three options.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers 1 to 9 (JSON array, up to 12 entries)',
  url: 'https://leetcode.com/problems/find-the-maximum-length-of-valid-subsequence-i/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Alternating', input: '[1,2,3,4]' },
    { label: 'Mixed parity', input: '[1,2,1,1,2,1,2]' },
  ],
}

export default function ValidSubsequenceI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index}
      roleAt={i => (run.input[i] % 2 === 0 ? 'even' : 'odd')} />
    <p aria-label="Counts">{`Evens: ${step.evens}; odds: ${step.odds}; alternating runs: ${step.runs}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>If every neighbouring sum has the same parity, the neighbours either all share one parity (sums even) or alternate (sums odd). The answer is the larger class or the number of alternating runs.</p>
  </>} />
}
