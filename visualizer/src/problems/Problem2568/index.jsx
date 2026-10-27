import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Collect', description: 'Store the numbers in a set.' },
    { id: 'check', label: 'Present', description: 'The candidate power of two is in nums, so try the next one.' },
    { id: 'found', label: 'Missing', description: 'The candidate is absent, so no subsequence OR can make it.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: 1 to 30 integers from 1 to 1000, e.g. {"nums":[2,1]}',
  url: 'https://leetcode.com/problems/minimum-impossible-or/',
  complexity: 'O(n + log A) time and O(n) space for the set. The visualization caps the input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1]}' },
    { label: 'Example 2', input: '{"nums":[5,3,2]}' },
  ],
}

export default function MinimumImpossibleOr() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Numbers">{`nums: ${run.input.nums.join(', ')}`}</output>
    <output aria-label="Candidate">{`Candidate: ${step.candidate}${step.present.includes(step.candidate) ? ' (present in nums)' : ' (absent)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every value below the answer is an OR of some subsequence, and each power of two can only be produced by a subsequence that contains that power of two.</p>
    <p>So the first power of two missing from nums is the smallest impossible OR.</p>
  </>} />
}
