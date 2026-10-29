import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start both running totals at 0.' },
    { id: 'scan', label: 'Scan', description: 'Visit each number and its digits.' },
    { id: 'update', label: 'Update', description: 'Add to the element sum or the digit sum.' },
    { id: 'done', label: 'Result', description: 'Return the absolute difference.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array object (JSON, e.g. {"nums": [1, 15, 6, 3]})',
  url: 'https://leetcode.com/problems/difference-between-element-sum-and-digit-sum-of-an-array/',
  complexity: 'O(n * d) time for n numbers with at most d digits each, O(1) extra space. The visualization caps the array at 2000 numbers.',
  examples: [
    { label: 'Nonzero difference', input: '{"nums": [1,15,6,3]}' },
    { label: 'Equal totals', input: '{"nums": [1,2,3,4]}' },
  ],
}

export default function DifferenceElementDigitSum() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Numbers"
            length={run.input.nums.length}
            active={step.index}
            valueAt={(i) => run.input.nums[i]}
            roleAt={(i) => (i < step.index ? 'done' : '')}
          />
          <output aria-label="Running totals">Element sum: {step.elementSum} · Digit sum: {step.digitSum}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
