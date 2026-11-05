import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1318', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Integers a, b and c (JSON object)',
  url: 'https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/',
  complexity: 'O(log max(a, b, c)) time and O(1) extra space, since only the bit positions are visited.',
}

export default function FlipBitsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <RecordStateTable label={`Bits of a = ${run.input.a}, b = ${run.input.b}, c = ${run.input.c}, from the lowest position`}
        columns={['bit', 'a', 'b', 'c', 'flips']} rows={s.rows} activeRow={s.rows.length - 1} />
      <StackLane title="Total flips" items={[String(s.flips)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Per bit:</strong> a OR b must match c at every position, so each bit position is decided on its own. A 0 in c needs both a and b to be 0 there; a 1 in c needs at least one of them to be 1.</p>
    <p>{step.message}</p>
  </>} />
}
