import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'No commas counted yet.' },
    { id: 'group', label: 'Group', description: 'Count the numbers that gain a comma here.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n',
  url: 'https://leetcode.com/problems/count-commas-in-range/',
  complexity: 'Only a handful of thresholds exist, so the count is O(log n) in the number of digits. The visual caps n at 100000.',
  examples: [
    { label: 'Example', input: '{"n":12345}' },
    { label: 'Upper range', input: '{"n":99999}' },
  ],
}

const THRESHOLDS = [1000, 1000000, 1000000000]

// Number line on a log scale: each threshold starts a band of numbers that gain one more comma, up to n.
function ThresholdLine({ n, group }) {
  const width = 520, pad = 24
  const max = Math.log10(Math.max(n, 1000))
  const x = v => pad + (Math.log10(v) / max) * (width - pad * 2)
  return <svg viewBox={`0 0 ${width} 80`} width="100%" role="img" aria-label={`Numbers from 1 to ${n} on a log scale with the comma thresholds`} style={{ maxWidth: width }}>
    <line x1={pad} y1={40} x2={width - pad} y2={40} stroke="var(--text-muted)" />
    {THRESHOLDS.filter(t => t <= n).map(t => <g key={t}>
      <rect x={x(t)} y={30} width={Math.max(4, x(n) - x(t))} height={20} fill={group === t ? 'var(--primary)' : 'var(--surface2)'} opacity={group === t ? 0.9 : 0.6} />
      <line x1={x(t)} y1={24} x2={x(t)} y2={56} stroke="var(--text)" strokeWidth="2" />
      <text x={x(t) + 4} y={70} fontSize="11" fill="var(--text)">{t.toLocaleString('en-US')}</text>
    </g>)}
    <text x={x(n)} y={18} textAnchor="end" fontSize="11" fill="var(--text)">n = {n.toLocaleString('en-US')}</text>
  </svg>
}

export default function CountCommasInRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ThresholdLine n={run.input.n} group={step.group} />
    <table aria-label="Comma thresholds">
      <thead><tr><th scope="col">Threshold</th><th scope="col">Numbers gaining a comma</th></tr></thead>
      <tbody>{THRESHOLDS.filter(t => t <= run.input.n).map(t =>
        <tr key={t} data-role={step.group === t ? 'target' : ''}><th scope="row">{t.toLocaleString('en-US')}</th><td>{run.input.n - t + 1}</td></tr>)}</tbody>
    </table>
    <output aria-label="Comma total">{`Commas so far: ${step.commas}`}</output>
  </>} renderReasoning={() => <>
    <p>A number has a comma for each thousand group above its first three digits. So every number from 1,000 up gets one, every number from 1,000,000 up gets a second, and so on.</p>
    <p>Each threshold therefore contributes n minus the threshold plus one.</p>
  </>} />
}
