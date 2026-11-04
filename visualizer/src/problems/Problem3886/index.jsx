import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'block', label: 'Blocks', description: 'Find a rotation that matches each block to its sorted slice.' },
    { id: 'divisor', label: 'Divisor', description: 'Decide whether this block length is sortable.' },
    { id: 'done', label: 'Result', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of integers from 1 to 20',
  url: 'https://leetcode.com/problems/sum-of-sortable-integers/',
  complexity: 'This visual tries each rotation of each block: at most n times k checks per divisor. The visual caps nums at 12 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[4,5,1,2]}' },
    { label: 'Example B', input: '{"nums":[2,1,3,4]}' },
  ],
}

export default function SumOfSortableIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.nums.length
    const inBlock = index => step.start !== null && step.start !== undefined && index >= step.start && index < step.start + step.k
    return <>
      <IndexedSequence label={step.k ? `nums, split into blocks of length ${step.k}` : 'nums (no block length chosen yet)'} length={n}
        active={step.start !== null && step.start !== undefined ? step.start : -1}
        valueAt={index => run.input.nums[index]}
        roleAt={index => !step.k ? '' : inBlock(index) ? (index === step.start ? 'l' : 'in block') : ''} />
      {step.want && <IndexedSequence label={`Sorted target for this block (positions ${step.start}–${step.start + step.k - 1})`} length={step.want.length}
        valueAt={offset => step.want[offset]} roleAt={offset => step.rotation >= 0 ? `rotate ${step.rotation}` : 'no match'} />}
      <output aria-label="Sum so far">{`Total ${step.total}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Sorting the whole array means every block must hold exactly the sorted values for its positions, and it must be a rotation of them.</p>
    <p>A divisor counts only when every block works, and the answer sums those divisors.</p>
  </>} />
}
