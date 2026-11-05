import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples } from './algorithm'

const definition = {
  number: '1401', phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, examples,
  inputLabel: 'Circle and rectangle as a JSON object',
  url: 'https://leetcode.com/problems/circle-and-rectangle-overlapping/',
  complexity: 'O(1) time and O(1) space.',
}

const SCALE = 16, PAD = 20

function Plane({ s }) {
  const xs = [s.left, s.right, s.cx - s.radius, s.cx + s.radius, s.nx ?? s.cx]
  const ys = [s.bottom, s.top, s.cy - s.radius, s.cy + s.radius, s.ny ?? s.cy]
  const lo = Math.min(...xs, ...ys) - 1, hi = Math.max(...xs, ...ys) + 1
  const span = Math.max(1, hi - lo)
  const px = x => PAD + ((x - lo) / span) * (220 - 2 * PAD)
  const py = y => 220 - (PAD + ((y - lo) / span) * (220 - 2 * PAD))
  return <svg viewBox="0 0 220 220" role="img" aria-label="Circle and rectangle on the plane" style={{ maxWidth: 220, width: '100%' }}>
    <rect x={px(s.left)} y={py(s.top)} width={px(s.right) - px(s.left)} height={py(s.bottom) - py(s.top)} fill="var(--surface2)" stroke="var(--border)" strokeWidth="2" />
    <circle cx={px(s.cx)} cy={py(s.cy)} r={(s.radius / span) * (220 - 2 * PAD)} fill="none" stroke="var(--primary)" strokeWidth="2" />
    <circle cx={px(s.cx)} cy={py(s.cy)} r="3" fill="var(--text)" />
    {s.nx !== undefined && <circle cx={px(s.nx)} cy={py(s.ny)} r="4" fill="var(--text)" />}
  </svg>
}

export default function CircleRectangleVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <Plane s={s} />
      <StackLane title="Squared distance against squared radius" items={[`${s.dist2 ?? '…'} vs ${s.radius * s.radius}`]} note={s.result === undefined ? undefined : s.result ? 'overlap' : 'no overlap'} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Nearest point:</strong> clamping the centre into the rectangle gives the closest rectangle point, so one distance check decides the overlap.</p>
    <p>{step.message}</p>
  </>} />
}
