import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Instruction string made of G, L and R (for example GRGRG)',
  url: 'https://leetcode.com/problems/robot-bounded-in-circle/',
  complexity: 'O(n) time and O(1) extra space for an instruction string of length n. Four passes are simulated.',
  examples: [
    { label: 'Turns back', input: 'GRGRG' },
    { label: 'Drifts', input: 'RGL' },
    { label: 'Wide loop', input: 'GGRGG' },
  ],
}

function Path({ run, step }) {
  const all = run.frames.at(-1).snapshot.path
  const xs = all.map(p => p[0])
  const ys = all.map(p => p[1])
  const minX = Math.min(0, ...xs)
  const maxX = Math.max(0, ...xs)
  const minY = Math.min(0, ...ys)
  const maxY = Math.max(0, ...ys)
  const s = 24
  const pad = 20
  const toX = x => pad + (x - minX) * s
  const toY = y => pad + (maxY - y) * s
  const width = (maxX - minX) * s + pad * 2
  const height = (maxY - minY) * s + pad * 2
  const points = step.snapshot.path.map(([x, y]) => `${toX(x)},${toY(y)}`).join(' ')
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Robot path" style={{ width, maxWidth: '100%' }}>
    <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="2" />
    <circle cx={toX(0)} cy={toY(0)} r="4" fill="var(--surface2)" stroke="var(--text)" />
    <circle cx={toX(step.snapshot.x)} cy={toY(step.snapshot.y)} r="5" fill="var(--text)" />
  </svg>
}

export default function RobotCircleWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <Path run={run} step={step} />
      <output aria-label="Heading">{`Heading ${step.snapshot.heading}, pass ${step.snapshot.pass} of 4`}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Simulating four passes is enough: after at most four repetitions the heading returns to north, so the robot either returns to the origin or never does.</p>
    </>}
  />
}
