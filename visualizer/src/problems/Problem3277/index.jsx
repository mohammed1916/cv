import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'single', label: 'Singles', description: 'A lone element is its own score.' },
    { id: 'combine', label: 'Windows', description: 'Build each window from two shorter windows.' },
    { id: 'query', label: 'Queries', description: 'Read the stored best value for a query range.' },
    { id: 'done', label: 'Answers', description: 'All queries are answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/maximum-xor-score-subarray-queries/description/',
  complexity: 'O(n^2 + q) time and O(n^2) space. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Example', input: '{"nums":[2,8,4,32,16,1],"queries":[[0,2],[1,4],[0,5]]}' },
    { label: 'Short', input: '{"nums":[0,7,3],"queries":[[0,2],[1,2]]}' },
  ],
}

export default function MaximumXorScoreSubarrayQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.r ?? -1}
      roleAt={i => (step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Window score">{step.l >= 0
      ? `window ${step.l}..${step.r}: score ${step.value}, best inside ${step.best}`
      : 'Answers are read from the best table.'}</output>
  </>} renderReasoning={() => <>
    <p>Repeatedly XOR-ing neighbours leaves one value per window. That value equals the XOR of the two windows one element shorter at each end, so each window needs only one step.</p>
    <p>A second table keeps the largest score found inside each window, so every query is a single lookup.</p>
  </>} />
}
