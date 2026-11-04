import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, sql } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with asOf, window, minOrders, customers and transactions',
  complexity: 'O(c + t) time for c customers and t transactions, using one count per customer. The visualization caps the data at 8 customers and 20 transactions.',
  examples: [
    { label: 'Minimum of three', input: '{"asOf":20,"window":10,"minOrders":3,"customers":[{"id":1,"name":"Ana"},{"id":2,"name":"Ben"},{"id":3,"name":"Cy"},{"id":4,"name":"Dee"}],"transactions":[{"customer":1,"day":5},{"customer":1,"day":12},{"customer":2,"day":11},{"customer":3,"day":13},{"customer":1,"day":15},{"customer":2,"day":20},{"customer":3,"day":14},{"customer":4,"day":2},{"customer":1,"day":19},{"customer":3,"day":18},{"customer":3,"day":20},{"customer":4,"day":3}]}' },
    { label: 'Minimum of two', input: '{"asOf":20,"window":10,"minOrders":2,"customers":[{"id":1,"name":"Ana"},{"id":2,"name":"Ben"},{"id":3,"name":"Cy"},{"id":4,"name":"Dee"}],"transactions":[{"customer":1,"day":5},{"customer":1,"day":12},{"customer":2,"day":11},{"customer":3,"day":13},{"customer":1,"day":15},{"customer":2,"day":20},{"customer":3,"day":14},{"customer":4,"day":2},{"customer":1,"day":19},{"customer":3,"day":18},{"customer":3,"day":20},{"customer":4,"day":3}]}' },
  ],
}

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

export default function FindLoyalCustomers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={phases} active={step.phase} />
    <h2>{meta.title}</h2>
    <table aria-label="Customer counts in the window">
      <thead><tr><th>Customer</th><th>Count in window</th><th>Status</th></tr></thead>
      <tbody>{step.rows.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.count}</td><td>{r.status}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current step">{step.message}</output>
    <pre aria-label="SQL equivalent">{sql}</pre>
  </>} renderReasoning={() => <>
    <p>Teaching rule: a customer is loyal when at least minOrders purchases fall on days from asOf minus window plus 1 up to asOf.</p>
    <p>Count each customer's in-window purchases once, then keep the customers whose count reaches the minimum. The SQL uses a join, a date filter, a group and a HAVING test for the same steps.</p>
  </>} />
}
