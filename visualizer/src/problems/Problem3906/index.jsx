import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, routeIndices } from './algorithm'

const definition = {
  phases: [
    { id: 'route', label: 'Route', description: 'Show the 4 by 4 grid and the route.' },
    { id: 'digit', label: 'Digit DP', description: 'Advance one digit position at a time.' },
    { id: 'done', label: 'Result', description: 'Subtract the two counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with l, r (decimal strings below 10^16) and directions (three D and three R)',
  url: 'https://leetcode.com/problems/count-good-integers-on-a-grid-path/',
  complexity: 'O(16 * 10 * states) digit DP per bound, where the states are tight flag and last route digit. The visual shows a 16-digit example.',
  examples: [
    { label: 'Small range', input: '{"l":"0","r":"300","directions":"DDDRRR"}' },
    { label: 'Mixed route', input: '{"l":"1234","r":"5678","directions":"RDRDRD"}' },
  ],
}

// The 4 by 4 grid of the sample r. Route cells carry their order (1 to 7) and are shaded.
function Grid({ digits, chain }) {
  const order = new Map(chain.map((cell, step) => [cell, step + 1]))
  return <table aria-label="Sample r in the 4 by 4 grid" className="route-grid">
    <tbody>{[0, 1, 2, 3].map(row => <tr key={row}>{[0, 1, 2, 3].map(col => {
      const cell = row * 4 + col
      const on = order.has(cell)
      return <td key={col} data-role={on ? 'window' : ''} style={{ textAlign: 'center', minWidth: 56, padding: 8, border: '1px solid var(--text-muted)', background: on ? 'var(--primary)' : 'var(--surface2)', color: on ? 'var(--surface)' : 'var(--text)' }}>
        <strong>{digits[cell] ?? '0'}</strong>{on && <small> · {order.get(cell)}</small>}
      </td>
    })}</tr>)}</tbody>
  </table>
}

export default function CountGoodIntegersOnAGridPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Grid digits={run.input.r.padStart(16, '0').split('')} chain={routeIndices(run.input.directions)} />
    <p>Route: start at cell 0, then apply {run.input.directions.split('').join(' ')}. Digits on the route must not decrease.</p>
    <output aria-label="Count status">{step.count !== null && step.count !== undefined ? `Good integers: ${step.count}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The seven route cells are visited in increasing index order, so the rule is that their digits never decrease along the route.</p>
    <p>A digit DP counts 16-digit strings up to a bound, remembering whether the prefix is still tight and the last route digit.</p>
  </>} />
}
