import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No orders', description: 'With no orders there is one empty sequence.' },
    { id: 'order', label: 'Add order', description: 'Place the pickup and then the delivery of the next order.' },
    { id: 'done', label: 'Complete', description: 'Report the count for all orders.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of orders (JSON object with n from 1 to 8)',
  url: 'https://leetcode.com/problems/count-all-valid-pickup-and-delivery-options/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps n at 8.',
  examples: [
    { label: 'Two orders', input: '{"n":2}' },
    { label: 'Three orders', input: '{"n":3}' },
  ],
}

export default function PickupDelivery() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="ways[k]: valid sequences for k orders" values={[step.dp]} rowLabels={['ways']}
      columnLabels={step.dp.map((_, k) => k)}
      activeCell={step.phase === 'order' ? { row: 0, column: step.k } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every valid sequence for k - 1 orders can be extended by order k. Its pickup can go in any of the 2k - 1 gaps.</p>
    <p>The delivery must follow its pickup. Summed over all pickup positions, that gives k(2k - 1) placements, so the count multiplies by k(2k - 1).</p>
  </>} />
}
