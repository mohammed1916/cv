import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1475', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Prices as a JSON array',
  url: 'https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/',
  complexity: 'O(n) time: each index is pushed and popped once, and O(n) extra space for the stack.',
}

export default function DiscountStackVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Prices, with the running result" length={run.input.length}
        valueAt={i => `${s.prices[i]} → ${s.result[i]}`} active={s.current ?? -1}
        roleAt={i => (s.stack.includes(i) ? 'waiting' : '')} />
      <StackLane title="Waiting positions (stack, top last)" items={s.stack.map(i => `${i}: ${s.prices[i]}`)} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Monotonic stack:</strong> prices wait in increasing order; a later price that is no bigger pays out to every waiting price above it.</p>
    <p>{step.message}</p>
  </>} />
}
