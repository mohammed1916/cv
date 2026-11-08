import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Unfold the mirrored room.' },
    { id: 'gcd', label: 'GCD step', description: 'Euclid reduces (p, q) to find the gcd.' },
    { id: 'reduce', label: 'Reduce', description: 'Divide out the gcd to get the first corner hit.' },
    { id: 'parity', label: 'Parity', description: 'Parities of m and n pick the receptor.' },
    { id: 'done', label: 'Complete', description: 'Report the receptor.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array [p, q] (JSON, 1 <= q <= p <= 1000)',
  url: 'https://leetcode.com/problems/mirror-reflection/',
  complexity: 'O(log p) for the gcd, O(1) for the parity test.',
  examples: [
    { label: 'p=2, q=1', input: '[2,1]' },
    { label: 'p=3, q=1', input: '[3,1]' },
    { label: 'p=3, q=2', input: '[3,2]' },
    { label: 'p=6, q=4', input: '[6,4]' },
    { label: 'p=1000, q=250', input: '[1000,250]' },
    { label: 'Smallest pair', input: '[1,1]' },
    { label: 'Equal p and q', input: '[4,4]' },
    { label: 'Largest p', input: '[1000,1]' },
    { label: 'Long run: p=997, q=499', input: '[997,499]' },
  ],
}

const names = ['0 (east, bottom)', '1 (east, top)', '2 (west, top)']

// The unfolded room: m copies across and n copies up. The straight ray runs from the origin to the first corner (m, n).
function Unfolded({ m, n }) {
  const cell = 18
  const W = m * cell + 20, H = n * cell + 20
  const x = c => 10 + c * cell
  const y = r => 10 + (n - r) * cell
  const lines = []
  for (let c = 0; c <= m; c++) lines.push(<line key={`v${c}`} x1={x(c)} x2={x(c)} y1={y(0)} y2={y(n)} stroke="var(--border)" />)
  for (let r = 0; r <= n; r++) lines.push(<line key={`h${r}`} x1={x(0)} x2={x(m)} y1={y(r)} y2={y(r)} stroke="var(--border)" />)
  return <svg role="img" aria-label="Unfolded room grid with the straight ray to the first corner" viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', marginTop: 8 }}>
    {lines}
    <line x1={x(0)} y1={y(0)} x2={x(m)} y2={y(n)} stroke="var(--primary)" strokeWidth={3} />
    <circle cx={x(0)} cy={y(0)} r={4} fill="var(--text)" />
    <circle cx={x(m)} cy={y(n)} r={6} fill="var(--primary)" stroke="var(--text)" />
  </svg>
}

export default function MirrorReflection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { p, q } = run.input
    const m = step.m, n = step.n
    return <>
      <table aria-label="Reduction">
        <tbody>
          <tr><th>p, q</th><td>{p}, {q}</td></tr>
          <tr><th>Euclid pair (a, b)</th><td>{step.a === null ? '—' : `${step.a}, ${step.b}`}</td></tr>
          <tr><th>gcd</th><td>{step.g ?? '—'}</td></tr>
          <tr><th>m = p / gcd (room widths)</th><td>{m ?? '—'}{m !== null && ` (${m % 2 ? 'odd: east wall' : 'even: west wall'})`}</td></tr>
          <tr><th>n = q / gcd (room heights)</th><td>{n ?? '—'}{n !== null && ` (${n % 2 ? 'odd: top edge' : 'even: bottom edge'})`}</td></tr>
        </tbody>
      </table>
      {m !== null && m !== undefined && m <= 16 && n <= 16 && <Unfolded m={m} n={n} />}
      <output aria-label="Receptor" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>{step.phase === 'done' ? `Receptor ${names[run.result]}` : 'Receptor not decided yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Unfolding:</strong> reflecting the square at every bounce turns the zigzag into a straight line with slope q/p. Receptors sit at corners of the unfolded grid, at positions (a*p, b*p).</p>
    <p><strong>First corner:</strong> the line reaches height n*p after m*p of horizontal travel where m*q = n*p; the smallest such pair is m = p/g, n = q/g.</p>
    <p><strong>Parity:</strong> an even number of heights means a bottom edge (receptor 0); odd means top. An odd number of widths means the east wall (receptor 1), even the west wall (receptor 2).</p>
  </>} />
}
