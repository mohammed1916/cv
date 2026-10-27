import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Place the robot at the origin facing north.' },
    { id: 'turn', label: 'Turn', description: 'Rotate left or right by 90 degrees.' },
    { id: 'move', label: 'Move', description: 'Walk one unit and update the best squared distance.' },
    { id: 'blocked', label: 'Blocked', description: 'An obstacle stops the current command.' },
    { id: 'done', label: 'Complete', description: 'Return the maximum squared distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {commands, obstacles} (JSON)',
  url: 'https://leetcode.com/problems/walking-robot-simulation/',
  complexity: 'O(total steps + obstacles) time, O(obstacles) space. The visualization caps commands at 30 with moves of 1 to 9.',
  examples: [
    { label: 'Example 1', input: '{"commands":[4,-1,3],"obstacles":[]}' },
    { label: 'Example 2', input: '{"commands":[4,-1,4,-2,4],"obstacles":[[2,4]]}' },
    { label: 'Example 3', input: '{"commands":[6,-1,-1,6],"obstacles":[]}' },
  ],
}

function Grid({ run, step }) {
  const pts = [...step.trail, ...run.input.obstacles, [step.x, step.y], [0, 0]]
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs) - 1; const maxX = Math.max(...xs) + 1
  const minY = Math.min(...ys) - 1; const maxY = Math.max(...ys) + 1
  const w = maxX - minX + 1; const h = maxY - minY + 1
  const px = (x) => (x - minX) + 0.5
  const py = (y) => (maxY - y) + 0.5
  const arrow = [[0, -0.35], [0.35, 0], [0, 0.35], [-0.35, 0]][step.d]
  return <svg role="img" aria-label="Robot grid" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxHeight: 340 }}>
    <rect x="0" y="0" width={w} height={h} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.05" />
    <polyline points={step.trail.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke="#15803d" strokeWidth="0.12" />
    {run.input.obstacles.map(([ox, oy], i) => <rect key={i} x={px(ox) - 0.35} y={py(oy) - 0.35} width="0.7" height="0.7" fill="#b91c1c" />)}
    {step.blocked && <circle cx={px(step.blocked[0])} cy={py(step.blocked[1])} r="0.5" fill="none" stroke="#f59e0b" strokeWidth="0.1" />}
    <circle cx={px(0)} cy={py(0)} r="0.15" fill="currentColor" />
    <circle cx={px(step.x)} cy={py(step.y)} r="0.3" fill="#2563eb" />
    <line x1={px(step.x)} y1={py(step.y)} x2={px(step.x) + arrow[0] * 1.6} y2={py(step.y) + arrow[1] * 1.6} stroke="#2563eb" strokeWidth="0.1" />
  </svg>
}

export default function WalkingRobotSimulation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="commands (-2 left, -1 right)" length={run.input.commands.length} active={step.cmd} valueAt={i => run.input.commands[i]} />
    <Grid run={run} step={step} />
    <output aria-label="Robot state">Position ({step.x}, {step.y}) facing {['north', 'east', 'south', 'west'][step.d]} | max squared distance: {step.best}</output>
  </>} renderReasoning={() => <>
    <p>Each positive command is executed one unit at a time because an obstacle can appear on any cell of the path; hitting one cancels the remainder of that command only, and later commands still run.</p>
    <p>The maximum is tracked after every step, since the farthest point may be passed through rather than ended on.</p>
  </>} />
}
