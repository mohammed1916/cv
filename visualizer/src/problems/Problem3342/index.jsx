import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin in the top-left room at time 0 with a 1-second move next.' },
    { id: 'settle', label: 'Leave room', description: 'Take the earliest state and move with its alternating cost.' },
    { id: 'relax', label: 'Enter room', description: 'Wait for the room to open, then record the arrival for the next cost.' },
    { id: 'done', label: 'Complete', description: 'Report the time to reach the last room.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Opening times move_time (JSON)',
  url: 'https://leetcode.com/problems/find-minimum-time-to-reach-last-room-ii/',
  complexity: 'O(m n log(m n)) time with two states per room. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"move_time":[[0,4],[4,4]]}' },
    { label: 'Zeros', input: '{"move_time":[[0,0,0],[0,0,0]]}' },
  ],
}

export default function LastRoomTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.move_time} label="Room opens at second" activeCell={active} cellWidth={44} cellHeight={40} />
      <DistanceMatrixView label="Earliest arrival so far (either parity)" matrix={step.matrix} activeCell={active} />
      <output aria-label="Time">{step.phase === 'done' ? `Answer: ${run.result}` : `Current time: ${step.time}, next move takes ${step.next}s`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The move cost depends on how many moves came before, so a room is reached in two states: one where the next move takes one second and one where it takes two. Each state is settled separately.</p>
  </>} />
}
