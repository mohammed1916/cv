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
    { label: 'Single cost', input: '{"cost":[7]}' },
    { label: 'Equal costs tie', input: '{"cost":[5,5,5,5]}' },
    { label: 'Largest costs', input: '{"cost":[100,1,100]}' },
    { label: 'Long run: 100 costs', input: '{"cost":[18,33,36,8,1,75,20,5,93,72,71,11,91,85,44,14,73,28,13,47,95,95,23,1,39,56,79,62,77,69,34,40,41,9,1,1,100,21,77,65,81,35,2,5,60,88,39,20,84,40,53,80,78,74,7,59,94,90,60,23,76,97,99,3,51,87,59,80,80,99,82,49,25,82,75,7,100,78,59,72,78,13,5,67,45,74,18,68,29,8,75,43,47,31,56,67,95,90,28,68]}' },
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
