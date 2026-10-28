import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with empty letter sums.' },
    { id: 'add', label: 'Add cost', description: 'Add this character cost to its letter sum.' },
    { id: 'done', label: 'Complete', description: 'Delete everything except the most expensive letter.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letters and costs (JSON object with s and cost)',
  url: 'https://leetcode.com/problems/minimum-deletion-cost-to-make-all-characters-equal/',
  complexity: 'O(n) time and O(1) extra space for 26 letters. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"s":"aabaac","cost":[1,2,3,4,1,10]}' },
    { label: 'Example 2', input: '{"s":"abc","cost":[10,5,8]}' },
  ],
}

export default function MinimumDeletionCostEqualCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, cost } = run.input
    return <IndexedSequence label="Characters" length={s.length} valueAt={i => s[i]} active={step.index}
      roleAt={i => `cost ${cost[i]}`} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Keeping every copy of one letter costs nothing extra, so the deletion cost is the total minus the best letter sum.</p>
  </>} />
}
