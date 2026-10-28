import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Hour 0', description: 'Close at hour 0, so every Y customer is penalised.' },
    { id: 'hour', label: 'Move hour', description: 'Pass one customer and update the penalty.' },
    { id: 'done', label: 'Complete', description: 'Report the earliest hour with the minimum penalty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with customers: 1 to 12 characters, each Y or N',
  url: 'https://leetcode.com/problems/minimum-penalty-for-a-shop/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"customers":"YYNY"}' },
    { label: 'Example 2', input: '{"customers":"NNNNN"}' },
  ],
}

export default function MinimumPenaltyForShop() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="customers" length={run.input.customers.length} valueAt={index => run.input.customers[index]} active={step.index}
      roleAt={index => index < step.hour ? 'open' : 'closed'} />
    <output aria-label="Penalty">{`Closing hour ${step.hour}: penalty ${step.penalty}`}</output>
    <output aria-label="Best hour">{`Best so far: hour ${step.bestHour} with penalty ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A shop that closes at hour j is penalised for each Y after the closing and each N before it.</p>
    <p>Moving the closing hour past one customer changes the penalty by exactly one, so the whole sweep takes one pass.</p>
  </>} />
}
