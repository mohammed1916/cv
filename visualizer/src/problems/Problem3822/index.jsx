import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
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

// Price ladder: one row per price, with the active buy and sell ids that sit there right now.
function PriceLadder({ active, focus }) {
  const prices = [...new Set(active.map(([, , price]) => price).concat(focus === null ? [] : [focus]))].sort((a, b) => b - a)
  if (prices.length === 0) return <p className="ladder-empty">No active orders.</p>
  return <table aria-label="Active orders by price">
    <thead><tr><th>price</th><th>buy</th><th>sell</th></tr></thead>
    <tbody>{prices.map(price => {
      const at = active.filter(([, , p]) => p === price)
      const ids = side => at.filter(([, s]) => s === side).map(([id]) => id).join(', ') || '—'
      return <tr key={price} data-current={focus === price ? 'yes' : undefined}>
        <td>{price}{focus === price ? ' (queried)' : ''}</td><td>{ids('buy')}</td><td>{ids('sell')}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function DesignOrderManagementSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.at >= 0 ? run.input.ops[step.at] : null
    const focus = current && current[0] === 'getOrdersAtPrice' ? current[2] : null
    const ops = run.input.ops.map((op, i) => ({ name: op[0], args: op.slice(1), returned: step.results[i] ?? undefined }))
    return <>
      <PriceLadder active={step.active} focus={focus} />
      <OperationLog title="Operations" ops={ops} current={step.at} through={step.at >= 0 ? step.at : ops.length - 1} />
      <output aria-label="Current operation">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every order keeps its side, price and an active flag. Cancelling flips the flag rather than deleting the record, so the id stays reserved.</p>
    <p>The ladder groups active orders by price. A price query only counts orders whose flag is still active and whose side and price match.</p>
  </>} />
}
