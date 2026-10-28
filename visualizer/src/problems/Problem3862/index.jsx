import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Totals', description: 'Find the total and the capped right products.' },
    { id: 'check', label: 'Check index', description: 'Compare the left sum with the right product.' },
    { id: 'found', label: 'Balanced', description: 'The left sum equals the right product.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest balanced index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/find-the-smallest-balanced-index/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,2]}' },
    { label: 'Example 2', input: '{"nums":[2,8,2,2,5]}' },
    { label: 'No index', input: '{"nums":[1]}' },
  ],
}

export default function SmallestBalancedIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i < step.index ? 'left' : i > step.index && step.index >= 0 ? 'right' : '')} />
    <output aria-label="Sums">{`Left sum: ${step.left}, right product: ${step.right === null ? '-' : step.right}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The left sum grows as the index moves right. Right products are capped just above the total, since a larger product can never equal a left sum.</p>
  </>} />
}
