import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty stack', description: 'No survivors yet.' },
    { id: 'explode', label: 'Collision', description: 'The smaller asteroid explodes.' },
    { id: 'both', label: 'Equal', description: 'Equal sizes explode together.' },
    { id: 'push', label: 'Survive', description: 'The asteroid moves on.' },
    { id: 'done', label: 'Complete', description: 'Return the survivors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Asteroids (JSON object with an asteroids array)',
  url: 'https://leetcode.com/problems/asteroid-collision/',
  complexity: 'O(n) time and O(n) space: each asteroid is pushed and popped at most once.',
  examples: [
    { label: 'Chain', input: '{"asteroids":[6,-3,-4,5,-9]}' },
    { label: 'Equal', input: '{"asteroids":[7,-7,-2,3]}' },
    { label: 'Long run', input: '{"asteroids":[-2,-1,1,2]}' },
  ],
}

export default function AsteroidCollision() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Asteroids in order (the current one is marked)" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]}
      roleAt={i => (i < step.index ? 'done' : '')} />
    <StackLane title="Survivors moving right (bottom to top)" items={step.stack.map(String)} note={step.value === undefined ? undefined : `incoming ${step.value}`} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only a left-mover can collide, and only with right-movers on top of the stack. Collisions repeat until the incoming asteroid is safe or gone.</p>
    <p>Two left-movers never meet, so the stack never holds a left-mover below a right-mover on the same side.</p>
  </>} />
}
