import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Strength', description: 'The OR of all numbers is the target strength.' },
    { id: 'subset', label: 'Submask', description: 'Count the numbers that fit inside one submask of the strength.' },
    { id: 'done', label: 'Result', description: 'Subtract the subsets that keep the full strength from all subsets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 15)',
  url: 'https://leetcode.com/problems/number-of-effective-subsequences/',
  complexity: 'O(2^b * n) time for b set bits in the strength, with exact small powers of two. The visualization caps nums at 8 values from 1 to 15.',
  examples: [
    { label: 'Example', input: '{"nums":[3,5,6]}' },
    { label: 'Repeated', input: '{"nums":[4,4,1,2]}' },
    { label: "Single value", input: "{\"nums\":[1]}" },
    { label: "All equal, length 8", input: "{\"nums\":[7,7,7,7,7,7,7,7]}" },
    { label: "Largest values, descending", input: "{\"nums\":[15,14,13,12,11,10,9,8]}" },
    { label: "Long run: 8 values", input: "{\"nums\":[8,4,10,9,6,7,15,10]}" },
  ],
}

export default function NumberOfEffectiveSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.sub !== null && step.sub !== undefined && (run.input.nums[i] & ~step.sub) === 0 ? 'window' : '')} />
    <output aria-label="Submask check">{step.phase === 'done'
      ? `Effective subsequences: ${step.answer}`
      : step.inside === null
        ? `Strength ${step.total} (binary ${step.total.toString(2)})`
        : `Submask ${step.sub.toString(2)}: ${step.inside} numbers fit, sign ${step.sign > 0 ? '+' : '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>A removal is effective exactly when the remaining numbers miss at least one bit of the strength, so the count is all subsets minus those whose remainder still has the full strength.</p>
    <p>Inclusion-exclusion over the submasks of the strength counts the subsets that cover every bit, with alternating signs.</p>
  </>} />
}
