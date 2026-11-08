import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'No commas counted yet.' },
    { id: 'group', label: 'Group', description: 'Count the numbers that gain a comma at this threshold.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (up to 1000000000000000)',
  url: 'https://leetcode.com/problems/count-commas-in-range-ii/',
  complexity: 'Only one step per thousand-group up to n, so the loop runs a handful of times. Arithmetic uses BigInt to stay exact.',
  examples: [
    { label: 'Example', input: '{"n":987654321}' },
    { label: 'Million', input: '{"n":1000000}' },
    { label: 'Single integer', input: '{"n":1}' },
    { label: 'Just below a thousand', input: '{"n":999}' },
    { label: 'Upper limit', input: '{"n":1000000000000000}' },
    { label: 'Long run: 15 digits', input: '{"n":999999999999999}' },
  ],
}

const THRESHOLDS = [1000n, 1000000n, 1000000000n, 1000000000000n, 1000000000000000n]

// Thresholds on a log scale, because n can reach 10^15; the band from the active threshold up to n is shaded.
function ThresholdLine({ n, group }) {
  const width = 520, pad = 24
  const max = Math.log10(Math.max(Number(n), 1000))
  const x = v => pad + (Math.log10(Number(v)) / max) * (width - pad * 2)
  return <svg viewBox={`0 0 ${width} 80`} width="100%" role="img" aria-label={`Numbers from 1 to ${n} on a log scale with the comma thresholds`} style={{ maxWidth: width }}>
    <line x1={pad} y1={40} x2={width - pad} y2={40} stroke="var(--text-muted)" />
    {THRESHOLDS.filter(t => t <= n).map(t => <g key={String(t)}>
      <rect x={x(t)} y={30} width={Math.max(4, x(n) - x(t))} height={20} fill={group === String(t) ? 'var(--primary)' : 'var(--surface2)'} opacity={group === String(t) ? 0.9 : 0.6} />
      <line x1={x(t)} y1={24} x2={x(t)} y2={56} stroke="var(--text)" strokeWidth="2" />
      <text x={x(t) + 4} y={70} fontSize="11" fill="var(--text)">{Number(t).toLocaleString('en-US')}</text>
    </g>)}
    <text x={x(n)} y={18} textAnchor="end" fontSize="11" fill="var(--text)">n = {Number(n).toLocaleString('en-US')}</text>
  </svg>
}

export default function CountCommasInRangeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ThresholdLine n={BigInt(run.input.n)} group={step.group} />
    <table aria-label="Comma groups">
      <thead><tr><th scope="col">Group starts at</th><th scope="col">Numbers gaining a comma</th></tr></thead>
      <tbody>{step.group ? <tr data-role="target"><th scope="row">{Number(step.group).toLocaleString('en-US')}</th><td>{Number(step.added).toLocaleString('en-US')}</td></tr> : null}</tbody>
    </table>
    <output aria-label="Comma total">{`Commas so far: ${Number(step.commas).toLocaleString('en-US')}`}</output>
  </>} renderReasoning={() => <>
    <p>Every number at or above a thousand-group threshold gains one more comma, so each threshold contributes the count of numbers from it up to n.</p>
    <p>The totals can pass the range of ordinary integers in other languages, so the walkthrough uses exact integer arithmetic.</p>
  </>} />
}
