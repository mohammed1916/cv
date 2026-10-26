import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty stack', description: 'No right-movers are waiting.' },
    { id: 'push', label: 'Survives', description: 'The asteroid joins the stack.' },
    { id: 'explode', label: 'Collision', description: 'The smaller asteroid explodes.' },
    { id: 'both', label: 'Equal collision', description: 'Both asteroids explode.' },
    { id: 'done', label: 'Complete', description: 'Return the survivors.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Asteroids (JSON array of non-zero integers)',
  url: 'https://leetcode.com/problems/asteroid-collision/',
  complexity: 'O(n) time and O(n) stack space, since each asteroid is pushed and popped at most once.',
  examples: [
    { label: 'Mixed', input: '[5,10,-5]' },
    { label: 'Both explode', input: '[8,-8]' },
    { label: 'Chain', input: '[10,2,-5]' },
  ],
}

export default function AsteroidCollision() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Asteroids" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (i === step.index ? step.phase : '')} />
    <StackLane title="Right-movers waiting" items={step.stack.map(String)} note={step.phase === 'done' ? 'survivors' : 'top is nearest'} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Stack invariant:</strong> the stack only holds right-movers, so each left-mover can only meet the top, the nearest one.</p>
  </>} />
}
