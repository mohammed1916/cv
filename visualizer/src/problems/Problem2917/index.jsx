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
    { label: 'Own case 1', input: '{"nums":[8,13,10,9,10,16],"k":5}' },
    { label: 'Own case 2', input: '{"nums":[11,9,6,10,12,7,9],"k":2}' },
    { label: 'Single number, k = 1', input: '{"nums":[5],"k":1}' },
    { label: 'Equal numbers', input: '{"nums":[6,6,6],"k":3}' },
    { label: 'All five bits set in every number', input: '{"nums":[31,31,31,31,31,31,31,31],"k":8}' },
    { label: 'Zero when no bit repeats', input: '{"nums":[1,2,4],"k":3}' },
    { label: 'Long run: 8 items', input: '{"nums":[29,20,17,7,7,4,16,11],"k":4}' },
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
