import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
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
      <IndexedSequence label="Room capacities (from the entrance, after the shortest-so-far rule)" length={s.caps.length}
        valueAt={i => s.caps[i]} active={s.room ?? -1} roleAt={i => (i === s.room ? 'l' : '')} />
      <StackLane title="Boxes, smallest first" items={[...s.boxes].sort((a, b) => a - b).map(String)} note={s.box !== undefined ? `current box ${s.box}` : undefined} />
      <StackLane title="Boxes placed" items={[String(s.count ?? 0)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two pointers:</strong> the smallest unplaced box is matched with the first room whose capacity can hold it; both pointers only move forward.</p>
    <p>{step.message}</p>
  </>} />
}
