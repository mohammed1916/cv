import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sides', label: 'Sides', description: 'Split the people around pos.' },
    { id: 'sum', label: 'Split count', description: 'Choose how many visible people come from each side.' },
    { id: 'done', label: 'Result', description: 'Combine the sum with the free choice at pos.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, pos and k',
  url: 'https://leetcode.com/problems/direction-assignments-with-exactly-k-visible-people/',
  complexity: 'O(k) binomial terms once the coefficients are known. The visual caps n at 30.',
  examples: [
    { label: 'Example A', input: '{"n":4,"pos":1,"k":1}' },
    { label: 'Example B', input: '{"n":4,"pos":3,"k":2}' },
  ],
}

function binomial(n, r) {
  if (r < 0 || r > n) return 0n
  let value = 1n
  for (let i = 0; i < r; i++) value = value * BigInt(n - i) / BigInt(i + 1)
  return value
}

// Every split a + b = k that is possible, with the ways each side contributes.
function SplitTable({ left, right, k, current }) {
  const rows = []
  for (let a = 0; a <= Math.min(left, k); a++) {
    const b = k - a
    if (b < 0 || b > right) continue
    rows.push({ a, b, term: binomial(left, a) * binomial(right, b) })
  }
  return <table aria-label="Splits of the visible count">
    <thead><tr><th scope="col">visible on left (a)</th><th scope="col">visible on right (b)</th><th scope="col">ways</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.a} data-current={current === row.a ? 'yes' : undefined}>
      <td>{row.a}</td><td>{row.b}</td><td>{String(row.term)}</td></tr>)}</tbody>
  </table>
}

export default function DirectionAssignmentsWithExactlyKVisiblePeople() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div className="algorithm-sequence" aria-label="Line of people">
      <h3>Line of people</h3>
      <div className="algorithm-sequence__cells">{Array.from({ length: run.input.n }, (_, i) => (
        <div key={i} className={`algorithm-sequence__cell ${i === run.input.pos ? 'is-active' : ''}`} data-role={i === run.input.pos ? 'pos' : i < run.input.pos ? 'left' : 'right'}>
          <small>[{i}]</small><strong>{i === run.input.pos ? 'pos' : i < run.input.pos ? 'L side' : 'R side'}</strong><span>{i < run.input.pos ? "visible if 'L'" : i > run.input.pos ? "visible if 'R'" : 'free: ×2'}</span>
        </div>))}</div>
    </div>
    <SplitTable left={step.left} right={step.right} k={run.input.k} current={step.a} />
    <output aria-label="Count so far">{`Sides ${step.left} and ${step.right}; sum so far ${step.total}${step.a >= 0 ? `; split ${step.a}+${step.b}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Only people on the left of pos who pick L and people on the right who pick R are visible. So the visible count is a split between the two sides.</p>
    <p>Each split is counted with binomial coefficients, and the free person at pos doubles the total.</p>
  </>} />
}
