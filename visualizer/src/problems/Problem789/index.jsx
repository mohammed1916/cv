import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Your distance', description: 'Compute your Manhattan distance to the target.' },
    { id: 'safe', label: 'Ghost too far', description: 'This ghost needs strictly more moves than you.' },
    { id: 'caught', label: 'Ghost intercepts', description: 'This ghost can arrive no later than you.' },
    { id: 'done', label: 'Complete', description: 'Return whether escape is possible.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'ghosts and target (JSON)',
  url: 'https://leetcode.com/problems/escape-the-ghosts/',
  complexity: 'O(g) time, O(1) extra space. Visualization limited to 20 ghosts and |coordinate| <= 20.',
  examples: [
    { label: 'Escape (true)', input: '{"ghosts":[[1,0],[0,3]],"target":[0,1]}' },
    { label: 'Blocked (false)', input: '{"ghosts":[[1,0]],"target":[2,0]}' },
    { label: 'Tie (false)', input: '{"ghosts":[[2,0]],"target":[1,0]}' },
  ],
}
const S = 12
function Board({ ghosts, target, current }) {
  const pts = [[0, 0], target, ...ghosts]
  const r = Math.max(3, ...pts.flatMap(p => p.map(Math.abs))) + 1
  const px = c => (c + r) * S, py = c => (r - c) * S, size = 2 * r * S
  return <svg role="img" aria-label="Plane with you, target and ghosts" viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 360 }}>
    <line x1={0} y1={py(0)} x2={size} y2={py(0)} stroke="currentColor" opacity="0.25" />
    <line x1={px(0)} y1={0} x2={px(0)} y2={size} stroke="currentColor" opacity="0.25" />
    {ghosts.map((g, i) => <circle key={i} cx={px(g[0])} cy={py(g[1])} r={i === current ? 6 : 4} fill={i === current ? '#dc2626' : '#9333ea'}><title>Ghost {i}</title></circle>)}
    <rect x={px(target[0]) - 5} y={py(target[1]) - 5} width="10" height="10" fill="#16a34a"><title>Target</title></rect>
    <circle cx={px(0)} cy={py(0)} r="4" fill="#2563eb"><title>You</title></circle>
  </svg>
}
export default function EscapeTheGhosts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Board ghosts={run.input.ghosts} target={run.input.target} current={step.current} />
    <IndexedSequence label="Ghost distance to target" length={Math.max(step.dists.length, 1)} active={step.current} valueAt={i => step.dists[i] ?? ' '} roleAt={i => step.dists[i] !== undefined && step.dists[i] <= step.mine ? 'blocks' : ''} />
    <output aria-label="Your distance">Your distance: {step.mine}. {step.phase === 'done' ? `Can escape: ${run.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Chasing you is pointless: any ghost that could meet you somewhere on your path could instead go straight to the target and wait, arriving no later. So only the target distance matters.</p>
  </>} />
}
