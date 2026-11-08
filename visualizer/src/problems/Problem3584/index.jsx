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
    { label: 'Mixed signs, m four', input: '{"nums":[4,-2,8,-6,3,1],"m":4}' },
    { label: 'All negative values', input: '{"nums":[-4,-9,-1,-6],"m":2}' },
    { label: 'Single negative value', input: '{"nums":[-4],"m":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"m":2}' },
    { label: 'Extreme values', input: '{"nums":[100,-100,100,-100],"m":4}' },
    { label: 'Long run: 10 values', input: '{"nums":[25,27,-94,-69,-22,60,81,59,87,-70],"m":5}' },
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
