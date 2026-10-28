import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is chosen yet; the sum is zero.' },
    { id: 'skip', label: 'Banned', description: 'Skip a banned integer.' },
    { id: 'take', label: 'Take', description: 'Take the integer; it still fits under the limit.' },
    { id: 'stop', label: 'Stop', description: 'The next integer would exceed the limit, so stop.' },
    { id: 'done', label: 'Complete', description: 'Report how many integers were chosen.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with banned (integers 1 to 20), n (1 to 15) and maxSum (1 to 60)',
  url: 'https://leetcode.com/problems/maximum-number-of-integers-to-choose-from-a-range-i/',
  complexity: 'O(n + banned) time. The visualization caps n at 15.',
  examples: [
    { label: 'Example 1', input: '{"banned":[1,6,5],"n":5,"maxSum":6}' },
    { label: 'Example 2', input: '{"banned":[1,2,3,4,5,7],"n":8,"maxSum":1}' },
  ],
}

export default function MaximumIntegersRangeI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Integers 1 to n (banned or taken)" length={run.input.n} valueAt={i => i + 1} indexOffset={1} active={step.value ? step.value - 1 : -1} roleAt={i => (run.input.banned.includes(i + 1) ? 'banned' : i + 1 <= step.value && step.count && !run.input.banned.includes(i + 1) ? 'taken' : '')} />
    <output aria-label="Sum and count">{`Sum ${step.sum}, count ${step.count} (limit ${run.input.maxSum})`}</output>
  </>} renderReasoning={() => <>
    <p>Taking the smallest allowed integers first gives the most integers for a given sum, because any swap for a larger value only uses more of the budget.</p>
    <p>Once the next allowed integer would exceed the limit, every later integer does too, so the scan can stop.</p>
  </>} />
}
