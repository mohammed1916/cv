import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No factories', description: 'Without factories, no robot can be repaired.' },
    { id: 'cell', label: 'Assign block', description: 'Give the last few sorted robots to this factory, within its limit.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest assignment of every robot.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with robot positions and factory [position, limit] pairs (JSON)',
  url: 'https://leetcode.com/problems/minimum-total-distance-traveled/',
  complexity: 'O(F * R * limit) time and O(F * R) space for F factories and R robots. The visualization caps input at 5 robots and 3 factories.',
  examples: [
    { label: 'Example 1', input: '{"robot":[0,4,6],"factory":[[2,2],[6,2]]}' },
    { label: 'Example 2', input: '{"robot":[1,-1],"factory":[[-2,1],[2,1]]}' },
    { label: 'Single robot', input: '{"robot":[0],"factory":[[0,1]]}' },
    { label: 'Equal positions', input: '{"robot":[3,3],"factory":[[3,1],[3,1]]}' },
    { label: 'Largest values', input: '{"robot":[-20,-10,0,10,20],"factory":[[-20,4],[0,4],[20,4]]}' },
    { label: 'Long run: 5 robots', input: '{"robot":[-20,-17,8,-3,-4],"factory":[[-17,4],[9,4],[0,4]]}' },
  ],
}

export default function MinimumTotalDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Minimum distance (rows: factories, columns: robots repaired)" values={step.table}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Robots ${run.input.robot.length}, factories ${run.input.factory.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting the robots and the factories lets each factory take a contiguous block of robots in an optimal solution.</p>
    <p>Each cell chooses how many of the next robots this factory repairs, up to its limit, and adds the distance for each.</p>
  </>} />
}
