import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The result starts at 0.' },
    { id: 'bit', label: 'Bit', description: 'Count the numbers with this bit set and keep the bit if the count reaches k.' },
    { id: 'done', label: 'Complete', description: 'Report the k-or.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": threshold} with values 0 to 31',
  url: 'https://leetcode.com/problems/find-the-k-or-of-an-array/',
  complexity: 'O(n * 31) time. The visualization checks bits 0 to 5 for values up to 31.',
  examples: [
    { label: 'Example 1', input: '{"nums":[7,12,9,8,9,15],"k":4}' },
    { label: 'Example 2', input: '{"nums":[10,8,5,9,11,6,8],"k":1}' },
  ],
}

export default function KOr() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Numbers with each bit set (bit 0 to 5)" length={step.counts.length} valueAt={i => step.counts[i]} active={step.bit}
      roleAt={i => (step.result & (1 << i) ? 'kept' : '')} />
    <output aria-label="Result">{`Result so far: ${step.result}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A bit belongs to the k-or when at least k numbers have it set, which is a counting question per bit position.</p>
    <p>Equivalently, the k-or is the OR of the AND of every group of k numbers, which is why the counts are enough.</p>
  </>} />
}
