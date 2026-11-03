import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '1475',
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Prices (JSON array of integers)',
  url: 'https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/',
  complexity: 'O(n) time and O(n) space: each index is pushed and popped at most once. The visualization caps the shop at 200 items.',
  examples: [
    { label: 'Mixed', input: '[5,2,4,1,3]' },
    { label: 'Equal run', input: '[6,6,6]' },
    { label: 'Rising', input: '[1,2,3,4]' },
  ],
}

export default function FinalPricesVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prices" length={run.input.length} valueAt={i => step.scene.result[i]}
      active={step.scene.cursor} roleAt={i => (i === step.scene.resolved ? 'done' : (step.scene.waiting.includes(i) ? 'waiting' : ''))} />
    <StackLane title="Waiting for a discount" items={step.scene.waiting.map(i => `${i}: ${run.input[i]}`)}
      note={step.scene.resolved !== undefined ? `item ${step.scene.resolved} discounted` : undefined} />
  </>} renderReasoning={({ step }) => <>
    <p>The waiting stack stays in increasing price order. The first item that is no higher than a waiting item is that waiting item's discount, so the first match is found the moment it appears.</p>
    <p>{step.message}</p>
  </>} />
}
