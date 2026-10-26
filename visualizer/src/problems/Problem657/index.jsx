import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Origin', description: 'Start at (0, 0).' },
    { id: 'move', label: 'Move', description: 'Apply one move to the position.' },
    { id: 'done', label: 'Complete', description: 'Check whether the robot is at the origin.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Moves (JSON string of U, D, L, R)',
  url: 'https://leetcode.com/problems/robot-return-to-origin/',
  complexity: 'O(n) time and O(1) extra space: two counters.',
  examples: [
    { label: 'Returns', input: '"UD"' },
    { label: 'Square', input: '"UDLR"' },
    { label: 'Does not return', input: '"LL"' },
  ],
}

export default function RobotReturn() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Moves" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (i === step.index ? 'current' : '')} />
    <output aria-label="Position">Position ({step.x}, {step.y}){step.phase === 'done' ? ` · ${step.result ? 'back at origin' : 'not at origin'}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Balance:</strong> the robot returns exactly when U and D cancel and L and R cancel.</p>
  </>} />
}
