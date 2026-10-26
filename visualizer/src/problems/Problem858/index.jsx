import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Unfold the mirrored room.' },
    { id: 'gcd', label: 'GCD step', description: 'Euclid reduces (p, q) to find the gcd.' },
    { id: 'reduce', label: 'Reduce', description: 'Divide out the gcd to get the first corner hit.' },
    { id: 'parity', label: 'Parity', description: 'Parities of m and n pick the receptor.' },
    { id: 'done', label: 'Complete', description: 'Report the receptor.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Array [p, q] (JSON, 1 <= q <= p <= 1000)',
  url: 'https://leetcode.com/problems/mirror-reflection/',
  complexity: 'O(log p) for the gcd, O(1) for the parity test.',
  examples: [
    { label: 'p=2, q=1', input: '[2,1]' },
    { label: 'p=3, q=1', input: '[3,1]' },
    { label: 'p=3, q=2', input: '[3,2]' },
    { label: 'p=6, q=4', input: '[6,4]' },
    { label: 'p=1000, q=250', input: '[1000,250]' },
  ],
}

const names = ['0 (east, bottom)', '1 (east, top)', '2 (west, top)']

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
      <output aria-label="Receptor">{step.phase === 'done' ? `Receptor ${names[run.result]}` : 'Receptor not decided yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Unfolding:</strong> reflecting the square at every bounce turns the zigzag into a straight line with slope q/p. Receptors sit at corners of the unfolded grid, at positions (a*p, b*p).</p>
    <p><strong>First corner:</strong> the line reaches height n*p after m*p of horizontal travel where m*q = n*p; the smallest such pair is m = p/g, n = q/g.</p>
    <p><strong>Parity:</strong> an even number of heights means a bottom edge (receptor 0); odd means top. An odd number of widths means the east wall (receptor 1), even the west wall (receptor 2).</p>
  </>} />
}
