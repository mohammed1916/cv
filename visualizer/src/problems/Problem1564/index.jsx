import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import WarehouseBarsView from './WarehouseBarsView'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1564', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with boxes and warehouse (JSON)',
  url: 'https://leetcode.com/problems/put-boxes-into-the-warehouse-i/',
  complexity: 'O(n log n) time for the sorts, and O(n) extra space for the capacities.',
}

export default function WarehouseOneVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <WarehouseBarsView warehouse={run.input.warehouse} effective={s.caps} room={s.room ?? -1}
        sortedBoxes={[...run.input.boxes].sort((a, b) => a - b)} placed={s.count ?? 0} box={s.box} />
      <IndexedSequence label="Room capacities (from the entrance)" length={s.caps.length}
        valueAt={i => s.caps[i]} active={s.room ?? -1} roleAt={i => (i === s.room ? 'l' : '')} />
      <StackLane title="Boxes placed" items={[String(s.count ?? 0)]} note={s.box !== undefined ? `next box ${s.box}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two pointers:</strong> the smallest unplaced box is matched with the first room whose capacity can hold it; both pointers only move forward.</p>
    <p>{step.message}</p>
  </>} />
}
