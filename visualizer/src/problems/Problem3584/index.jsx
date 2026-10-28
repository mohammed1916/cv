import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No product has been found yet.' },
    { id: 'first', label: 'First index', description: 'Check every last index that is far enough away.' },
    { id: 'done', label: 'Complete', description: 'Report the largest product.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and m (JSON)',
  url: 'https://leetcode.com/problems/maximum-product-of-first-and-last-elements-of-a-subsequence/',
  complexity: 'O(n^2) time and O(1) space. The visualization caps nums at 10 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-1,-9,2,3,-2,-3,1],"m":1}' },
    { label: 'Example 2', input: '{"nums":[1,3,-5,5,6,-4],"m":3}' },
  ],
}

export default function FirstLastSubsequenceProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.first ?? -1}
      roleAt={i => (step.last === i ? 'last' : '')} />
    <output aria-label="Best">{`Best product: ${step.best === null ? 'none yet' : step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A subsequence keeps index order, so its first and last values are the chosen indices with the smallest and largest positions.</p>
  </>} />
}
