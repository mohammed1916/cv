import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Widest', description: 'Each left end starts with its widest subarray in the heap.' },
    { id: 'take', label: 'Take', description: 'Pop the largest remaining spread and add it to the total.' },
    { id: 'push', label: 'Shrink', description: 'The same left end offers its next shorter subarray.' },
    { id: 'done', label: 'Result', description: 'Report the total of the k chosen spreads.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (up to 8 non-negative integers) and k',
  url: 'https://leetcode.com/problems/maximum-total-subarray-value-ii/',
  complexity: 'Heap selection over one chain per left end, with range values computed directly. The visualization caps length at 8 and k at 20.',
  examples: [
    { label: 'Small', input: '{"nums":[2,7,4,1],"k":2}' },
    { label: 'Four values', input: '{"nums":[6,0,3,9],"k":3}' },
  ],
}

export default function MaximumTotalSubarrayValueII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.chosen.some(c => i >= c.l && i <= c.r) ? 'chosen' : '')} />
    <section aria-label="Candidate heap">
      <h3>Candidates (largest first)</h3>
      <ol>{step.candidates.slice(0, 5).map(c => <li key={`${c.l}-${c.r}`}>{`[${c.l}..${c.r}] value ${c.value}`}</li>)}</ol>
    </section>
    <output aria-label="Running total">{`chosen ${step.chosen.length} of ${run.input.k}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>For a fixed left end, shrinking the right end never increases max minus min. So each left end forms a chain of values that only goes down, and the k best subarrays are found by merging the chains with a heap.</p>
    <p>Each pop removes one chosen subarray and exposes the next shorter one from the same left end.</p>
  </>} />
}
