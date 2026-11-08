import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Begin with the whole array.' },
    { id: 'split', label: 'Split', description: 'Divide a range into two halves to sort first.' },
    { id: 'place', label: 'Merge write', description: 'Write the next smallest element into the range.' },
    { id: 'done', label: 'Complete', description: 'The array is sorted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/sort-an-array/',
  complexity: 'O(n log n) time, O(n) extra space, stable. The visualization caps the array at 64 values.',
  examples: [
    { label: 'Example 1', input: '[5,2,3,1]' },
    { label: 'Example 2', input: '[5,1,1,2,0,0]' },
    { label: 'Negatives', input: '[-4,7,0,-4,12,3,-9,8,1]' },
    { label: 'Single value', input: '[42]' },
    { label: 'Equal values', input: '[3,3,3,3]' },
    { label: 'Extreme values', input: '[50000,-50000,50000,-50000]' },
    { label: 'Long run: 64 values', input: '[32605,-22752,-8202,-47494,-31006,-9083,-17230,20227,39001,-32736,-351,-26445,-9710,-350,-19939,-15021,46860,-33991,31523,-43623,-27766,33084,23811,-19070,38869,-46516,-10087,31951,-3866,-36600,19935,-21455,-26014,17547,-44083,-8942,34963,-10725,-37096,-37187,-22606,29240,-41213,38729,-45287,-48178,-11623,4978,43198,41820,37758,-32158,39747,44061,9848,4929,-45512,-31959,30354,-42134,24194,36553,13953,25651]' },
  ],
}

export default function SortAnArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="nums (current range highlighted)" length={step.nums.length} active={step.k ?? -1} valueAt={i => step.nums[i]}
      roleAt={i => step.phase === 'done' ? 'sorted' : i >= step.lo && i < step.hi ? 'range' : ''} />
    {step.left && <IndexedSequence label="Left half (copy)" length={step.left.length} active={step.i < step.left.length ? step.i : -1} valueAt={i => step.left[i]} roleAt={i => i < step.i ? 'used' : ''} />}
    {step.right && <IndexedSequence label="Right half (copy)" length={step.right.length} active={step.j < step.right.length ? step.j : -1} valueAt={i => step.right[i]} roleAt={i => i < step.j ? 'used' : ''} />}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two sorted halves merge in linear time because the smallest unplaced element is always at the front of one of them. Using &lt;= keeps equal elements in original order.</p>
  </>} />
}
