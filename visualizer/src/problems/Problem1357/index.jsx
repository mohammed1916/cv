import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Store the price table and start the customer counter.' },
    { id: 'bill', label: 'Bill', description: 'Price each order and apply the discount on every nth customer.' },
    { id: 'done', label: 'Result', description: 'All bills are computed.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Cashier (JSON object with n, discount, products, prices, orders)',
  url: 'https://leetcode.com/problems/apply-discount-every-n-orders/',
  complexity: 'O(P) setup and O(|product|) per bill for P products. The visualization caps orders at 50.',
  examples,
}

export default function ApplyDiscountEveryNOrders() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="bills" length={run.input.orders.length} active={step.k}
        valueAt={i => (step.bills[i] !== undefined ? step.bills[i] : '...')}
        roleAt={i => (i < step.bills.length ? 'billed' : '')} />
      <dl>
        <dt>Customer count</dt><dd>{step.count}</dd>
        <dt>Subtotal</dt><dd>{step.subtotal ?? '-'}</dd>
      </dl>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
