import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Base', description: 'One unit costs nothing.' },
    { id: 'split', label: 'Split', description: 'Try every split of x and keep the cheapest.' },
    { id: 'done', label: 'Result', description: 'Report the cost for n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n',
  url: 'https://leetcode.com/problems/minimum-cost-to-split-into-ones/',
  complexity: 'The table costs O(n^2) time. The visual caps n at 30.',
  examples: [
    { label: 'Example', input: '{"n":6}' },
    { label: 'Small', input: '{"n":5}' },
  ],
}

// For the size being split, every split a + b = x with its total cost best[a] + best[b] + a * b.
function SplitOptions({ best, x, chosen }) {
  if (!x || x < 2) return null
  const rows = Array.from({ length: x - 1 }, (_, i) => i + 1).map(a => {
    const b = x - a
    return { a, b, total: best[a] + best[b] + a * b }
  })
  const cheapest = Math.min(...rows.map(r => r.total))
  return <table aria-label={`Splits of ${x}`}>
    <caption>Every split of {x} into a + b, and the cost a × b plus the best costs of both parts</caption>
    <thead><tr><th scope="col">a + b</th><th scope="col">cost a × b</th><th scope="col">total</th></tr></thead>
    <tbody>{rows.map(({ a, b, total }) => <tr key={a} data-current={chosen === a ? 'yes' : undefined} data-role={total === cheapest ? 'target' : ''}>
      <th scope="row">{a} + {b}</th><td>{a * b}</td><td>{total}{total === cheapest ? ' (cheapest)' : ''}</td></tr>)}</tbody>
  </table>
}

export default function MinimumCostToSplitIntoOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Best cost table">
      <thead><tr><th scope="col">Size</th><th scope="col">Best cost</th></tr></thead>
      <tbody>{step.best.map((cost, size) => size === 0 || size > (step.x ?? 0) ? null
        : <tr key={size} data-role={size === step.x ? 'target' : ''}><th scope="row">{size}</th><td>{cost}</td></tr>)}</tbody>
    </table>
    <SplitOptions best={step.best} x={step.x} chosen={step.a} />
    <output aria-label="Split status">{step.a ? `Best split of ${step.x}: ${step.a} + ${step.x - step.a}` : `Target size ${run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>Splitting x into parts a and b costs a times b, and each part can be split further at its own best cost.</p>
    <p>Each pair of unit pieces is separated exactly once over all splits, so the total is the same for every order, and the table confirms it.</p>
  </>} />
}
