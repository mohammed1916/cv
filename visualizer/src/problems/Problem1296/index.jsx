import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1296', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/divide-array-in-sets-of-k-consecutive-numbers/',
  complexity: 'O(n log n) time for the sort and O(n) extra space for the counts, with a run check of k steps per distinct value.',
}

export default function ConsecutiveSetsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Sorted values" length={s.sorted.length} valueAt={i => s.sorted[i]}
        active={-1}
        roleAt={i => (s.groupStart !== null && s.sorted[i] === s.groupStart ? 'l' : (s.groupEnd !== null && s.sorted[i] === s.groupEnd ? 'r' : ''))} />
      <p>{s.groupStart === null ? 'No run is open yet.' : `Run under test: ${s.groupStart} to ${s.groupEnd}. l marks the first value and r marks the last.`}</p>
      <RecordStateTable label="Copies left for each value" columns={['value', 'count']} rows={s.remaining}
        activeRow={s.remaining.findIndex(r => r.value === s.current)} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Greedy from the smallest:</strong> the smallest remaining value must begin a run, so every copy of it is placed into runs of length k starting at it.</p>
    <p>{step.message}</p>
  </>} />
}
