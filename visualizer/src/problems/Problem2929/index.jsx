import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the total to zero.' },
    { id: 'term', label: 'Terms', description: 'Add the inclusion-exclusion term for each number of overfull children.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and limit (JSON)',
  url: 'https://leetcode.com/problems/distribute-candies-among-children-ii/',
  complexity: 'O(1) time with the closed form. The visualization caps n and limit at 300.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"limit":2}' },
    { label: 'Example 2', input: '{"n":3,"limit":3}' },
  ],
}

export default function DistributeCandiesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Inclusion-exclusion terms" length={run.terms.length}
      valueAt={i => run.terms[i].term} active={Math.max(0, step.i)}
      roleAt={i => (i <= step.i ? 'added' : '')} />
    <output aria-label="Running total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>All nonnegative triples summing to n number C(n + 2, 2). Subtract those where one child takes more than the limit, then add back the pairs that overflow together.</p>
    <p>Each overfull child is counted by shifting n down by limit + 1, which keeps the count free of large loops.</p>
  </>} />
}
