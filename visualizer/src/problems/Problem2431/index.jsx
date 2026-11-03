import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CouponTableView from './CouponTableView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Start with nothing bought.' },
    { id: 'item', label: 'Fruit', description: 'Consider the next fruit.' },
    { id: 'merge', label: 'Merge', description: 'Compare full price and coupon for the target cell.' },
    { id: 'done', label: 'Result', description: 'Read the target cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with price, tastiness, maxAmount and maxCoupons',
  url: 'https://leetcode.com/problems/maximize-total-tastiness-of-purchased-fruits/',
  complexity: 'O(n * maxAmount * maxCoupons) time and O(maxAmount * maxCoupons) space with a rolling table. The visualization caps the input at 8 fruits, 3 coupons and money 24.',
  examples: [
    { label: 'Two coupons', input: '{"price":[10,6,8,4],"tastiness":[5,8,3,2],"maxAmount":12,"maxCoupons":2}' },
    { label: 'No coupons', input: '{"price":[7,3],"tastiness":[4,9],"maxAmount":8,"maxCoupons":0}' },
  ],
}

export default function MaximizeTotalTastiness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CouponTableView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each fruit is either skipped, bought at full price, or bought with its one allowed coupon. The table stores the best total for each pair of coupons used and money spent.</p>
  </>} />
}
