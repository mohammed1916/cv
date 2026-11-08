import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero bits.' },
    { id: 'merge', label: 'Fold in', description: 'OR each number into the running result.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum XOR.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 0 to 15), for example {"nums":[3,2,4,6]}',
  url: 'https://leetcode.com/problems/maximum-xor-after-operations/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Own: three values with zero', input: '{"nums":[0,15,7]}' },
    { label: 'Own: six values with repeats', input: '{"nums":[4,4,12,0,1,8]}' },
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Single zero', input: '{"nums":[0]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5]}' },
    { label: 'Largest values, 12 entries', input: '{"nums":[15,15,15,15,15,15,15,15,15,15,15,15]}' },
    { label: 'Long run: 12 values', input: '{"nums":[2,7,4,6,9,1,0,5,3,11,1,7]}' },
  ],
}

export default function MaximumXorAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} roleAt={i => (i < step.index ? 'folded' : '')} />
    <output aria-label="Result">{`Running result: ${step.result} (binary ${step.result.toString(2) || '0'})`}</output>
  </>} renderReasoning={() => <>
    <p>An operation keeps only some bits of one number, so no bit can appear that was not already present. The OR of all numbers is therefore an upper bound.</p>
    <p>The bound is reached: keep each bit in one number that has it and clear it from the others.</p>
  </>} />
}
