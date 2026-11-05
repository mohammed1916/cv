import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort and sum', description: 'Sort the numbers and build prefix sums.' },
    { id: 'query', label: 'Search counts', description: 'Binary search the largest count whose prefix sum stays within the limit.' },
    { id: 'done', label: 'Complete', description: 'Return the counts in query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"nums": [...], "queries": [...]}',
  url: 'https://leetcode.com/problems/longest-subsequence-with-limited-sum/',
  complexity: 'Sorting plus one binary search per query over the prefix sums. The visualization caps input at 8 numbers and 6 queries.',
  examples: [
    { label: 'Mixed sizes', input: '{"nums":[6,1,3,9],"queries":[4,11,20]}' },
    { label: 'Single query', input: '{"nums":[7,7,2],"queries":[8]}' },
  ],
}

export default function LongestSubsequenceLimitedSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.nums.length} valueAt={i => step.sorted[i]} active={-1}
      roleAt={i => (step.phase === 'query' && i < (step.mid ?? step.count ?? 0) ? 'counted' : '')} />
    <IndexedSequence label="Prefix sums (index = count of smallest numbers)" length={step.prefix.length} valueAt={i => step.prefix[i]} active={step.mid ?? step.count ?? -1}
      roleAt={i => (step.lo !== null && i === step.lo ? 'lo' : step.hi !== null && i === step.hi ? 'hi' : '')} />
    {step.lo !== null && <AnswerRangeBar title="Count search" min={0} max={run.nums.length} low={step.lo} high={step.hi} probe={step.mid} verdict={step.fits} />}
    <output aria-label="Count">{`Query ${step.query ?? '-'}: count ${step.count ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Taking the smallest numbers first gives the most items for any sum, so the best subsequence is always a prefix of the sorted numbers.</p>
    <p>Prefix sums only grow, so the largest count within a limit is found by binary search: lo and hi bound the answer, and the middle count decides which half remains.</p>
  </>} />
}
