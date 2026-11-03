import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'check', label: 'Check', description: 'Are all the values already equal?' },
    { id: 'and', label: 'AND', description: 'Fold the values into a running bitwise AND.' },
    { id: 'done', label: 'Result', description: 'Zero if already equal, otherwise one operation.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (list of integers)',
  url: 'https://leetcode.com/problems/minimum-operations-to-equalize-array/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps nums at 10 values.',
  examples: [
    { label: 'Example', input: '{"nums":[6,10,14]}' },
    { label: 'Already equal', input: '{"nums":[9,9,9,9]}' },
  ],
}

export default function MinimumOperationsToEqualizeArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i <= step.index ? 'folded' : '')} />
    <output aria-label="Running AND">{`running AND = ${step.value ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>An operation over the whole array replaces every element with the AND of all of them, so one operation always suffices when the values differ.</p>
    <p>The AND shown is the value every element takes after that single operation.</p>
  </>} />
}
