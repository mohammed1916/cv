import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1394', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/find-lucky-integer-in-an-array/',
  complexity: 'O(n + k log k) time for counting and sorting the k distinct values, and O(k) space.',
}

export default function LuckyIntegerVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const arr = run.input.arr
    return <>
      <IndexedSequence label="Input array (highlighted: value being counted)" length={arr.length} valueAt={i => arr[i]} active={arr.indexOf(s.current)} roleAt={i => (arr[i] === s.current ? 'value' : '')} />
      <RecordStateTable label="Value, count of that value, and whether it is lucky" columns={['value', 'count', 'lucky']} rows={s.counts}
        activeRow={s.counts.findIndex(r => r.value === s.current)} />
      <StackLane title="Largest lucky value so far" items={[String(s.best)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Frequency equals value:</strong> a lucky integer is one whose count is exactly itself, so counting once and comparing is enough.</p>
    <p>{step.message}</p>
  </>} />
}
