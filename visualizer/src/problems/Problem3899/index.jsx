import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, trianglePoints } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Three side lengths (JSON array)',
  url: 'https://leetcode.com/problems/angles-of-a-triangle/',
  complexity: 'O(1) time and space: exactly three sides. Displayed decimals are formatted; returned angles retain full precision.',
  phases: [
    { id: 'start', label: 'Sort sides', description: 'Associate sorted sides a, b, c with opposite vertices A, B, C.' },
    { id: 'check', label: 'Positive area?', description: 'Require a + b > c, not equality.' },
    { id: 'angle', label: 'Law of cosines', description: 'Compute each opposite angle in degrees.' },
    { id: 'done', label: 'Return sorted', description: 'Return sorted angles, or an empty array for invalid geometry.' },
  ],
  examples: [
    { label: 'Right triangle', input: '[3,4,5]' },
    { label: 'Degenerate', input: '[2,4,2]' },
    { label: 'Equilateral', input: '[5,5,5]' },
    { label: 'Obtuse', input: '[2,3,4]' },
    { label: 'Cannot close', input: '[1,2,10]' },
  ],
}

function TriangleDiagram({ sides, active }) {
  const raw = trianglePoints(sides), scale = Math.min(340 / sides[2], 230 / raw[2][1])
  const points = raw.map(([x, y]) => [60 + x * scale, 290 - y * scale])
  return <div className="algorithm-path__viewport">
    <svg viewBox="0 0 460 340" width="100%" style={{ minWidth: 280 }} role="img" aria-label={`Triangle with opposite side lengths A=${sides[0]}, B=${sides[1]}, C=${sides[2]}`}>
      <polygon points={points.map(p => p.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth={2} />
      {points.map(([x, y], i) => <g key={i} data-vertex={'ABC'[i]} data-role={i === active ? 'current-angle' : 'vertex'}>
        <circle cx={x} cy={y} r={i === active ? 9 : 4} fill="var(--primary)" />
        <text x={x} y={i === 2 ? y - 15 : y + 22} textAnchor="middle" fill="currentColor">{'ABC'[i]}</text>
      </g>)}
    </svg>
  </div>
}

export default function TriangleAngles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted sides a, b, c" length={3} active={step.index} valueAt={i => run.sides[i]} roleAt={i => `opposite ${'ABC'[i]}`} />
    {step.phase !== 'start' && (run.valid ? <TriangleDiagram sides={run.sides} active={step.index} /> : <p role="status">No positive-area triangle: {run.sides[0]} + {run.sides[1]} ≤ {run.sides[2]}.</p>)}
    <table><caption>Opposite-side / angle mapping</caption><thead><tr><th>Vertex</th><th>Opposite side</th><th>Angle (degrees)</th></tr></thead><tbody>
      {run.sides.map((side, i) => <tr key={i}><th>{'ABC'[i]}</th><td>{side}</td><td>{step.angles[i] === undefined ? 'not computed' : step.angles[i].toFixed(8)}</td></tr>)}
    </tbody></table>
    {step.phase === 'done' && <output aria-label="Triangle angles">{JSON.stringify(run.result)}</output>}
  </>} renderReasoning={({ run, step }) => <>
    <p>After sorting, a + b &gt; c is the decisive triangle inequality. Equality produces a line segment with zero area.</p>
    <p>For angle A opposite a: cos(A) = (b² + c² − a²) / (2bc). Convert radians to degrees with 180/π; use the analogous formula for B and C.</p>
    {step.phase === 'angle' && <p>Current ratio: {step.numerator} / {step.denominator} = {step.cosine.toFixed(10)}. Clamp only floating-point drift outside [−1,1].</p>}
    {step.phase === 'done' && run.valid && <p>Angle sum check: {run.result.reduce((a, b) => a + b, 0).toFixed(8)}°.</p>}
  </>} />
}
