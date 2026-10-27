import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the robots by their starting position.' },
    { id: 'right', label: 'Right mover', description: 'A right-moving robot waits on the stack.' },
    { id: 'collide', label: 'Collide', description: 'A left-moving robot meets the robot on top of the stack.' },
    { id: 'done', label: 'Complete', description: 'Report the healths of the survivors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positions, healths and directions string L or R (JSON)',
  url: 'https://leetcode.com/problems/robot-collisions/',
  complexity: 'O(n log n) time for sorting and O(n) for the stack pass.',
  examples: [
    { label: 'Example 1', input: '{"positions":[5,4,3,2,1],"healths":[2,17,9,15,10],"directions":"RRRRR"}' },
    { label: 'Example 2', input: '{"positions":[3,5,2,6],"healths":[10,10,15,12],"directions":"RLRL"}' },
  ],
}

export default function RobotCollisions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Robots (direction and health)" length={run.input.positions.length}
      valueAt={i => `${run.input.directions[i]} ${step.healths[i]}`} active={step.robot}
      roleAt={i => (step.healths[i] > 0 ? (step.stack.includes(i) ? 'waiting' : 'alive') : 'out')} />
    <output aria-label="Stack">{`Right movers waiting: ${step.stack.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Only a right mover followed by a left mover can collide, so robots are processed in position order and right movers wait on a stack.</p>
    <p>A left mover fights the nearest waiting right mover, and the winner keeps going.</p>
  </>} />
}
