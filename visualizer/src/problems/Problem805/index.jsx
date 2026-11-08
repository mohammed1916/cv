import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Reduce equal averages to a target subset sum.' },
    { id: 'feasible', label: 'Feasible sizes', description: 'Keep only sizes k where total*k is divisible by n.' },
    { id: 'init', label: 'Init sets', description: 'dp[0] = {0}.' },
    { id: 'absorb', label: 'Absorb element', description: 'Extend reachable sums per subset size.' },
    { id: 'check', label: 'Check target', description: 'Is total*k/n reachable with exactly k items?' },
    { id: 'done', label: 'Complete', description: 'Return the boolean.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/split-array-with-same-average/',
  complexity: 'Roughly O(n * n/2 * S) set work where S is the number of distinct sums; the early divisibility filter prunes most sizes.',
  examples: [
    { label: 'Six mixed values', input: '[7,1,5,3,9,11]' },
    { label: 'Two values', input: '[6,10]' },
    { label: 'No split (sizes pruned)', input: '[1,2,3,4,5,6,7,8,9]' }, { label: 'Single number', input: '[1]' }, { label: 'All equal values', input: '[2,2,2,2]' }, { label: 'Long run: 24 values', input: '[579,919,754,521,654,457,617,455,807,377,4,405,679,152,315,486,289,167,284,250,685,561,868,439]' },
  ],
}
export default function SplitArraySameAverage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (shaded = already absorbed into the sets)" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i <= step.index ? 'used' : ''} />
    <IndexedSequence label="Reachable sum count per subset size j" length={step.sizes.length} active={step.k} valueAt={j => step.sizes[j]} roleAt={j => step.ks.includes(j) ? 'candidate' : ''} />
    {step.sums && step.sums.length > 0 && <IndexedSequence label={`Reachable sums with exactly ${step.k} items (sorted)`} length={step.sums.length} active={step.sums.indexOf(step.target)} valueAt={i => step.sums[i]} roleAt={i => step.sums[i] === step.target ? 'target' : ''} />}
    {step.target !== null && <output aria-label="Target">k = {step.k}, target sum = {step.target}: {step.found ? 'reachable' : 'not reachable'}</output>}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Key identity:</strong> if A has k elements with sum s and the whole array has sum T over n items, then avg(A) = avg(B) = T/n, so s = T*k/n. One part is at most n/2 in size, so only k up to n/2 is tried.</p>
    <p>The sorted sums row lists every total that k items can reach. The split exists when the highlighted target is in that row.</p>
  </>} />
}
