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
    { label: 'Example', input: '{"nums":[3,6,10,1],"queries":[[0,1],[1,3],[0,3]]}' },
    { label: 'Short', input: '{"nums":[4,4,9],"queries":[[0,2],[1,1]]}' },
    { label: 'Single element', input: '{"nums":[0],"queries":[[0,0]]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5],"queries":[[0,2],[1,1]]}' },
    { label: 'Largest values and full range', input: '{"nums":[1023,0,1023,512,255,1023,1,2,4,8,16,32],"queries":[[0,11],[5,8]]}' },
    { label: 'Long run: twelve values, eight queries', input: '{"nums":[818,131,512,569,126,479,556,245,650,251,280,881],"queries":[[6,7],[4,9],[2,7],[0,1],[3,6],[5,8],[7,10],[0,9]]}' },
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
