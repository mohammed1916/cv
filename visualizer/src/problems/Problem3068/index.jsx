import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the plain sum of the values.' },
    { id: 'gain', label: 'Flip', description: 'Flipping this value increases the sum.' },
    { id: 'skip', label: 'Keep', description: 'Flipping this value would not help.' },
    { id: 'parity', label: 'Parity', description: 'An odd number of flips needs one correction.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (2 to 10 values) and k from 1 to 10 (JSON). The tree is not needed.',
  url: 'https://leetcode.com/problems/find-the-maximum-sum-of-node-values/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1],"k":3}' },
    { label: 'Example 2', input: '{"nums":[2,3],"k":7}' },
  ],
}

export default function MaxNodeValueSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.index} roleAt={i => (step.gains[i] > 0 ? `flip gives +${step.gains[i]}` : `keep (${step.gains[i]})`)} />
    <output aria-label="Sum so far">{`Flips so far: ${step.count}, sum ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two flips on adjacent nodes cancel k in one place and apply it in another, so the set of flipped nodes must have even size.</p>
    <p>Flip every value that gains from the change. If that set has odd size, the smallest gain in absolute value is the cheapest correction.</p>
  </>} />
}
