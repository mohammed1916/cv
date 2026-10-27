import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin in the top-left room at time 0.' },
    { id: 'settle', label: 'Leave room', description: 'Take the earliest known room and try its neighbours.' },
    { id: 'relax', label: 'Enter room', description: 'Wait for the room to open, then record the arrival.' },
    { id: 'done', label: 'Complete', description: 'Report the time to reach the last room.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Opening times move_time (JSON)',
  url: 'https://leetcode.com/problems/find-minimum-time-to-reach-last-room-i/',
  complexity: 'O(m n log(m n)) time. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"move_time":[[0,4],[4,4]]}' },
    { label: 'Zeros', input: '{"move_time":[[0,0,0],[0,0,0]]}' },
  ],
}

export default function LastRoomOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.move_time} label="Room opens at second" activeCell={active} cellWidth={44} cellHeight={40} />
      <DistanceMatrixView label="Earliest arrival so far" matrix={step.matrix} activeCell={active} />
      <output aria-label="Time">{step.phase === 'done' ? `Answer: ${run.result}` : `Current time: ${step.time}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each move takes one second, but the destination room can only be entered once it opens. Arriving earlier at a room never hurts, so Dijkstra with the earliest arrival is exact.</p>
  </>} />
}
