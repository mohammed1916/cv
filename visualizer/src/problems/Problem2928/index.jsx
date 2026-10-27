import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the total to zero.' },
    { id: 'first', label: 'First child', description: 'Fix how many candies the first child takes.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and limit (JSON)',
  url: 'https://leetcode.com/problems/distribute-candies-among-children-i/',
  complexity: 'O(n^2) time with two nested loops. The visualization caps n and limit at 50.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"limit":2}' },
    { label: 'Example 2', input: '{"n":3,"limit":3}' },
  ],
}

export default function DistributeCandiesI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Splits for each count the first child takes" length={run.rows.length}
      valueAt={i => run.rows[i]} active={Math.max(0, step.a)} roleAt={i => (i <= step.a ? 'counted' : '')} />
    <output aria-label="Total">{`Total splits so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Fixing the first child's count a and the second child's count b fixes the third child's count, so the loops enumerate every split once.</p>
    <p>The split is valid only when the third share is at most the limit.</p>
  </>} />
}
