import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1481', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with arr and k (JSON)',
  url: 'https://leetcode.com/problems/least-number-of-unique-integers-after-k-removals/',
  complexity: 'O(n log n) time for the sort of the distinct counts, and O(n) extra space.',
}

export default function LeastUniqueVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const arr = run.input.arr
    const rows = s.counts.map(r => ({ ...r, cheapest: s.sorted ? (s.sorted[0] === r.count ? 'next' : '') : '' }))
    return <>
      <IndexedSequence label="arr" length={arr.length} valueAt={i => arr[i]} active={-1} />
      <RecordStateTable label="Each value and how many copies it has" columns={['value', 'count']} rows={rows} activeRow={-1} />
      <StackLane title="Removals left and distinct values" items={[`removals left ${s.left ?? s.k}`, `distinct values ${s.unique ?? s.counts.length}`]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Remove whole values:</strong> removing a value means removing all of its copies, so the cheapest values to remove are those with the smallest counts.</p>
    <p>{step.message}</p>
  </>} />
}
