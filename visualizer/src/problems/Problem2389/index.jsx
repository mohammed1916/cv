import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the numbers and build prefix sums.' },
    { id: 'query', label: 'Query', description: 'Find the longest prefix whose sum stays within the limit.' },
    { id: 'done', label: 'Complete', description: 'Return the counts in query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"nums": [...], "queries": [...]}',
  url: 'https://leetcode.com/problems/longest-subsequence-with-limited-sum/',
  complexity: 'Sorting plus one binary search per query over the prefix sums. The visualization caps input at 8 numbers and 6 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,5,2,1],"queries":[3,10,21]}' },
    { label: 'Example 2', input: '{"nums":[2,3,4,5],"queries":[1]}' },
  ],
}

export default function LongestSubsequenceLimitedSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prefix sums of sorted numbers" length={run.prefix.length} valueAt={i => run.prefix[i]} active={step.count ?? -1} />
    <output aria-label="Count">{`Query ${step.query ?? '-'}: count ${step.count ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Taking the smallest numbers first gives the most items for any sum, so the best subsequence is always a prefix of the sorted numbers.</p>
    <p>Prefix sums only grow, so the largest prefix within a limit is found by binary search.</p>
  </>} />
}
