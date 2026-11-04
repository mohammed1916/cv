import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2481',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 4}',
  url: 'https://leetcode.com/problems/minimum-cuts-to-divide-a-circle/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"n":4}' },
    { label: 'Example 2', input: '{"n":3}' },
  ],
}

const R = 110
const C = 130

// The circle with the cuts drawn for n equal slices: diameters for even n, radii for odd n.
function CircleCuts({ n, kind }) {
  const lines = []
  if (kind === 'diameter') {
    for (let k = 0; k < n / 2; k++) {
      const a = (k * Math.PI) / (n / 2)
      lines.push([C - R * Math.cos(a), C - R * Math.sin(a), C + R * Math.cos(a), C + R * Math.sin(a)])
    }
  } else if (kind === 'radius') {
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n
      lines.push([C, C, C + R * Math.cos(a), C + R * Math.sin(a)])
    }
  }
  return <svg viewBox={`0 0 ${2 * C} ${2 * C}`} role="img" aria-label={`Circle cut into ${n} equal slices`} style={{ width: '100%', maxWidth: 260, height: 'auto' }}>
    <circle cx={C} cy={C} r={R} fill="var(--surface2)" stroke="var(--border)" strokeWidth={2} />
    {lines.map(([x1, y1, x2, y2], k) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />)}
    <circle cx={C} cy={C} r={3} fill="var(--text)" />
  </svg>
}

export default function MinimumCutsToDivideACircle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n } = run.input
    const shown = step.phase === 'done' || step.phase === 'even' || step.phase === 'odd'
    return <div style={{ display: 'grid', gap: 10, justifyItems: 'center', color: 'var(--text)' }}>
      {shown && step.cutKind !== 'none'
        ? <CircleCuts n={n} kind={step.cutKind} />
        : <p className="algorithm-readout">{n === 1 ? 'One slice is the whole circle, so no cut is needed.' : 'Checking whether one piece is already the answer.'}</p>}
      <output aria-label="Cuts">{`n = ${n}, cuts = ${step.result === null ? '...' : step.result}`}</output>
      <p role="status">{step.message}</p>
    </div>
  }} renderReasoning={() => <>
    <p>With an even count, every cut is a diameter through the centre, and two diameters give four equal pieces, so n/2 diameters give n pieces.</p>
    <p>With an odd count, diameters cannot give an odd number of equal pieces, so each cut is a radius from the centre to the edge and the answer is n. One piece needs no cut at all.</p>
  </>} />
}
