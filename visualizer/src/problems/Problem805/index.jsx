import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Reduce equal averages to a target subset sum.' },
    { id: 'feasible', label: 'Feasible sizes', description: 'Keep only sizes k where total*k is divisible by n.' },
    { id: 'init', label: 'Init sets', description: 'dp[0] = {0}.' },
    { id: 'absorb', label: 'Absorb element', description: 'Extend reachable sums per subset size.' },
    { id: 'check', label: 'Check target', description: 'Is total*k/n reachable with exactly k items?' },
    { id: 'done', label: 'Complete', description: 'Return the boolean.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/split-array-with-same-average/',
  complexity: 'Roughly O(n * n/2 * S) set work where S is the number of distinct sums; the early divisibility filter prunes most sizes.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5,6,7,8]' },
    { label: 'Example 2', input: '[3,1]' },
    { label: 'No split (sizes pruned)', input: '[1,2,3,4,5,6,7,8,9]' },
  ],
}
export default function SplitArraySameAverage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i < step.index ? 'used' : ''} />
    <IndexedSequence label="Number of reachable sums dp[j] (index = subset size j)" length={step.sizes.length} active={step.k} valueAt={j => step.sizes[j]} roleAt={j => step.ks.includes(j) ? 'candidate' : ''} />
    {step.target !== null && <output aria-label="Target">k = {step.k}, target sum = {step.target}: {step.found ? 'reachable' : 'not reachable'}</output>}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Key identity:</strong> if A has k elements with sum s and the whole array has sum T over n items, then avg(A) = avg(B) = T/n, so s = T*k/n. One part is at most n/2 in size, so only k up to n/2 is tried.</p>
  </>} />
}
