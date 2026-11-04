import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Targets', description: 'The answer is a factor pair of num plus 1 or num plus 2.' },
    { id: 'search', label: 'Search', description: 'Scan down from the square root to the nearest divisor.' },
    { id: 'done', label: 'Complete', description: 'Keep the pair with the smaller gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num from 1 to 1000000000, for example {"num":8}',
  url: 'https://leetcode.com/problems/closest-divisors/',
  complexity: 'O(sqrt(num)) time for each of the two targets.',
  examples: [
    { label: 'Example 1', input: '{"num":8}' },
    { label: 'Example 2', input: '{"num":123}' },
  ],
}

// A factor pair drawn as a rectangle: width a, height b, area target.
function PairRectangle({ pair }) {
  const [a, b] = pair
  const scale = 140 / Math.max(a, b)
  return <div aria-label={`Rectangle ${a} by ${b}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
    <div style={{ width: a * scale, height: b * scale, border: '2px solid var(--primary)', background: 'var(--surface2)', display: 'grid', placeItems: 'center', minWidth: 24, minHeight: 24 }}>
      {a} x {b}
    </div>
  </div>
}

export default function ClosestDivisors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label="Targets and their factor pairs" columns={['target', 'square root', 'pair', 'gap']}
      activeRow={run.targets.findIndex(t => t === step.target)}
      rows={run.targets.map((t, i) => ({
        target: t,
        'square root': Math.floor(Math.sqrt(t)),
        pair: run.pairs[i] ? `${run.pairs[i][0]} x ${run.pairs[i][1]}` : 'searching',
        gap: run.pairs[i] ? run.pairs[i][1] - run.pairs[i][0] : '—',
      }))} />
    <p><strong>Candidates tried:</strong> {step.scanned.length ? step.scanned.join(' → ') : step.candidate ?? 'none'}</p>
    {step.pairs.length > 0 && <PairRectangle pair={step.pairs[step.pairs.length - 1]} />}
    <output aria-label="Pairs found">{`Pairs found: ${step.pairs.map(p => `${p[0]} x ${p[1]}`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The closest factor pair of a number is the pair nearest its square root. Scanning down from the square root finds it first.</p>
    <p>Only num plus 1 and num plus 2 need checking, since one of them is always a product of two integers close together.</p>
  </>} />
}
