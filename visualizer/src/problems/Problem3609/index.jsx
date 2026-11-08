import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function StatePlane({ run, step }) {
  const [sx, sy, tx, ty] = run.input
  const size = Math.max(sx, sy, tx, ty, 1)
  const W = 260, pad = 24
  const at = v => pad + (v / size) * (W - pad * 2)
  const pt = (x, y) => ({ cx: at(x), cy: W - at(y) })
  return <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Coordinate plane with start, target and current state" style={{ width: 240, maxWidth: '100%' }}>
    <line x1={pad} y1={W - pad} x2={W - pad} y2={W - pad} stroke="var(--text)" strokeOpacity="0.4" />
    <line x1={pad} y1={pad} x2={pad} y2={W - pad} stroke="var(--text)" strokeOpacity="0.4" />
    <circle {...pt(sx, sy)} r={7} fill="var(--accent, var(--primary))" />
    <text {...pt(sx, sy)} dx={10} dy={-8} fontSize="11" fill="var(--text)">start</text>
    <rect x={pt(tx, ty).cx - 6} y={pt(tx, ty).cy - 6} width={12} height={12} fill="var(--primary)" />
    <text {...pt(tx, ty)} dx={10} dy={-8} fontSize="11" fill="var(--text)">target</text>
    {step.state && <circle {...pt(step.state[0], step.state[1])} r={11} fill="none" stroke="var(--primary)" strokeWidth="2" />}
  </svg>
}

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Start from the target and undo moves backward.' },
    { id: 'visit', label: 'Undo', description: 'Each state has at most four predecessors; keep the ones not below the start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of undone moves, or -1 when the start is unreachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array [sx, sy, tx, ty]',
  url: 'https://leetcode.com/problems/minimum-moves-to-reach-target-in-grid/',
  complexity: 'Each backward step shrinks the larger coordinate, so the search depth is O(log max(tx, ty)).',
  examples: [
    { label: 'Example 1', input: '[1,2,5,4]' },
    { label: 'Example 2', input: '[0,1,2,3]' },
    { label: 'Unreachable', input: '[1,1,2,2]' },
    { label: 'Start equals target', input: '[3,3,3,3]' },
    { label: 'Same column', input: '[2,2,2,6]' },
    { label: 'Largest coordinates', input: '[0,0,1000000000,1000000000]' },
    { label: 'Long run: distant target', input: '[649248,543731,1280389,904657]' },
  ],
}

export default function MinimumMovesTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StatePlane run={run} step={step} />
    <output aria-label="Current state">{step.state ? `State: (${step.state[0]}, ${step.state[1]}), distance ${step.distance}` : `No path, answer ${step.distance}`}</output>
    <output aria-label="Start">{`Start: (${run.input[0]}, ${run.input[1]}), target: (${run.input[2]}, ${run.input[3]})`}</output>
  </>} renderReasoning={() => <>
    <p>A move adds the larger coordinate to one of the two coordinates, so the values only grow. Run the walk in reverse from the target.</p>
    <p>Undoing a move has at most four possibilities, and the search keeps only states that are not below the start in either coordinate.</p>
  </>} />
}
