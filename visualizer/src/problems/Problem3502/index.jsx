import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No payment is known yet.' },
    { id: 'update', label: 'Cheaper', description: 'This cost beats the cheapest seen so far.' },
    { id: 'keep', label: 'Keep', description: 'The cheapest cost so far still holds.' },
    { id: 'record', label: 'Record', description: 'Write the cheapest cost for this position.' },
    { id: 'done', label: 'Complete', description: 'Every position has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with cost, for example {"cost": [5,3,4,1,3,2]}',
  url: 'https://leetcode.com/problems/minimum-cost-to-reach-every-position/',
  complexity: 'O(n) time and O(n) output. The visualization caps n at 100.',
  examples: [
    { label: 'Example 1', input: '{"cost":[5,3,4,1,3,2]}' },
    { label: 'Example 2', input: '{"cost":[1,2,4,6,7]}' },
  ],
}

export default function ReachEveryPosition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cost" length={run.input.cost.length} valueAt={index => run.input.cost[index]} active={step.index} roleAt={index => (index < step.index ? 'seen' : '')} />
    <output aria-label="Cheapest so far">{`Cheapest so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>To reach a position, one payment at or before it is enough, so the best answer is the cheapest cost seen up to that position.</p>
    <p>A single running minimum gives every answer in one pass.</p>
  </>} />
}
