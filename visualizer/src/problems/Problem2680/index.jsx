import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'tables', label: 'Prefix and suffix', description: 'Precompute the OR of everything left and right of each index.' },
    { id: 'try', label: 'Try index', description: 'Double this element k times and combine with the other ORs.' },
    { id: 'record', label: 'New best', description: 'This candidate is the largest so far.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum OR.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 12 values, 1 to 100) and k (0 to 6), e.g. {"nums":[12,9],"k":1}',
  url: 'https://leetcode.com/problems/maximum-or/',
  complexity: 'O(n) time and O(n) space for the prefix and suffix tables. The visualization caps the input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[12,9],"k":1}' },
    { label: 'Example 2', input: '{"nums":[8,1,2],"k":2}' },
  ],
}

export default function MaximumOr() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Values, doubled ${run.input.k} times at the active index`} length={run.input.nums.length}
      valueAt={i => run.input.nums[i]} active={step.index} roleAt={i => (i === step.index ? 'doubled' : '')} />
    <output aria-label="Best OR">{`Candidate: ${step.candidate ?? '-'}, best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The k doublings are most useful on a single element, since shifting one value spreads its bits into new positions.</p>
    <p>For each element, the OR of everything else is the prefix OR combined with the suffix OR, so each candidate takes constant time.</p>
  </>} />
}
