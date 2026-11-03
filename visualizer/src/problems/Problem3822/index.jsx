import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3822,
  phases: [
    { id: 'add', label: 'Add', description: 'Record a new active order.' },
    { id: 'modify', label: 'Modify', description: 'Move an active order to a new price.' },
    { id: 'cancel', label: 'Cancel', description: 'Mark an active order as inactive.' },
    { id: 'query', label: 'Query', description: 'Collect active orders with the requested side and price.' },
    { id: 'done', label: 'Result', description: 'All answers are collected.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["addOrder", id, "buy"|"sell", price], ["modifyOrder", id, price], ["cancelOrder", id], ["getOrdersAtPrice", side, price]',
  url: 'https://leetcode.com/problems/design-order-management-system/',
  complexity: 'Each query scans all orders here; a price-indexed map would narrow the scan.',
  examples: [
    { label: 'Move and cancel', input: '{"ops":[["addOrder",1,"buy",10],["addOrder",2,"buy",10],["addOrder",3,"sell",10],["getOrdersAtPrice","buy",10],["modifyOrder",2,12],["getOrdersAtPrice","buy",10],["cancelOrder",1],["getOrdersAtPrice","buy",10]]}' },
  ],
}

export default function DesignOrderManagementSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Operations">{run.input.ops.map((op, i) => <li key={i} data-current={step.at === i ? 'yes' : undefined}>
      {op.join(', ')}{step.results[i] !== null && step.results[i] !== undefined ? ` → [${step.results[i].join(', ')}]` : ''}</li>)}</ol>
    <table aria-label="Active orders">
      <thead><tr><th>id</th><th>side</th><th>price</th></tr></thead>
      <tbody>{step.active.map(([id, side, price]) => <tr key={id}><td>{id}</td><td>{side}</td><td>{price}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current operation">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every order keeps its side, price and an active flag. Cancelling flips the flag rather than deleting the record, so the id stays reserved.</p>
    <p>A price query only counts orders whose flag is still active and whose side and price match.</p>
  </>} />
}
