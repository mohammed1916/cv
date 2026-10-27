import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Child 0 holds the ball and the pass moves right.' },
    { id: 'pass', label: 'Pass', description: 'The ball moves one child in the current direction.' },
    { id: 'turn', label: 'Turn', description: 'The ball reached an end, so the direction reverses.' },
    { id: 'done', label: 'Complete', description: 'Report the child holding the ball.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n (children) and k (seconds)',
  url: 'https://leetcode.com/problems/find-the-child-who-has-the-ball-after-k-seconds/',
  complexity: 'O(k) time for the simulation. The visualization caps k at 200.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"k":5}' },
    { label: 'Example 2', input: '{"n":5,"k":6}' },
  ],
}

export default function BallAfterSeconds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Children in line" length={run.input.n} valueAt={i => i} active={step.child} />
    <output aria-label="Direction">{`Second ${step.second}, direction ${step.direction > 0 ? 'right' : 'left'}`}</output>
  </>} renderReasoning={() => <>
    <p>The ball walks to one end and then back, so the path repeats every 2(n-1) seconds.</p>
    <p>The simulation reverses direction at the first and last child, which keeps the same walk.</p>
  </>} />
}
