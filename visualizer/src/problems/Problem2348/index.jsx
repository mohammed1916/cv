import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2348',
  phases: [
    { id: 'zero', label: 'Zero run', description: 'A zero extends the run that ends here; each run length counts the subarrays ending at this position.' },
    { id: 'break', label: 'Break', description: 'A non-zero value ends the run.' },
    { id: 'done', label: 'Result', description: 'Return the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [0, 0, 1, 0, 0, 0]}',
  url: 'https://leetcode.com/problems/number-of-zero-filled-subarrays/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '{"nums":[0,0,1,0,0,0]}' },
    { label: 'Mixed', input: '{"nums":[-1,0,0,-2]}' },
    { label: 'Single zero', input: '{"nums":[0]}' },
    { label: 'Single non-zero', input: '{"nums":[2]}' },
    { label: 'All zeros', input: '{"nums":[0,0,0,0]}' },
    { label: 'Largest input, mixed values', input: '{"nums":[1,-1,0,2,0,0,-3,0,0,0,0,1,0,0,0,-2]}' },
    { label: 'Long run: 16 values', input: '{"nums":[-2,-2,0,1,-2,-2,-1,2,3,0,-2,1,-2,2,-3,3]}' },
  ],
}

export default function ZeroFilledSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.r}
      roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Count">{`${step.count} so far`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A run of zeros of length L contributes 1 + 2 + ... + L subarrays in total. Counting as we go is simpler: each zero adds the length of the zero run that ends at it.</p>
  </>} />
}
