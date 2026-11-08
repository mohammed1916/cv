import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only total 0 is reachable.' },
    { id: 'value', label: 'Reward', description: 'Extend the totals below this reward by taking it.' },
    { id: 'done', label: 'Complete', description: 'Report the largest reachable total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Reward values as JSON array (1 to 12, up to 8 values)',
  url: 'https://leetcode.com/problems/maximum-total-reward-using-operations-i/',
  complexity: 'O(n * S) time for total S, which is at most 2 times the largest value in the official problem. The visualization caps the input at 8 values.',
  examples: [
    { label: 'Own case 1', input: '[2,2,4,4]' },
    { label: 'Own case 2', input: '[2,7,5,4,3]' },
    { label: "Single reward", input: "[5]" },
    { label: "Largest rewards, all equal", input: "[12, 12, 12, 12, 12, 12, 12, 12]" },
    { label: "Long run: 8 rewards", input: "[12, 1, 11, 2, 10, 3, 9, 4]" },
  ],
}

export default function MaxTotalRewardI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const size = Math.max(1, Math.max(...step.reach) + 1)
    const row = Array.from({ length: size }, (_, t) => step.reach.includes(t))
    return <>
      <IndexedSequence label="Reachable totals" length={size} active={step.total}
        valueAt={t => (row[t] ? 'yes' : 'no')} roleAt={t => (step.added.includes(t) ? 'new' : '')} />
      <output aria-label="Largest total">{`Largest reachable total: ${Math.max(...step.reach)}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A reward can be taken only when the running total is below it, so rewards are taken in increasing order.</p>
    <p>Each reward is taken at most once, so the reachable totals behave like a 0/1 knapsack over sums.</p>
  </>} />
}
