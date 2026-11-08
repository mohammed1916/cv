import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2455',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty sum and no matches.' },
    { id: 'scan', label: 'Scan', description: 'Visit each number in order.' },
    { id: 'check', label: 'Check', description: 'Test whether the number is divisible by six.' },
    { id: 'add', label: 'Add', description: 'Add the number to the running sum.' },
    { id: 'done', label: 'Result', description: 'Return the floored average.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [2,6,9,12,18]}',
  url: 'https://leetcode.com/problems/average-value-of-even-numbers-that-are-divisible-by-three/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps nums at 50 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,9,12,18]}' },
    { label: 'No match', input: '{"nums":[1,5,7]}' },
    { label: 'Single value', input: '{"nums":[2]}' },
    { label: 'Equal values', input: '{"nums":[12,12,12]}' },
    { label: 'Largest values', input: '{"nums":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1]}' },
    { label: 'Long run: 50 values', input: '{"nums":[831,832,87,129,460,222,358,28,211,460,23,672,411,259,892,296,538,589,381,132,637,600,552,157,910,233,707,520,548,553,734,274,147,47,663,317,267,425,134,680,978,679,725,541,467,409,353,626,30,700]}' },
  ],
}

export default function AverageEvenDivisibleByThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (run.input.nums[i] % 6 === 0 && i <= step.at ? 'counted' : '')} />
    <output aria-label="Running average">{`sum ${step.total}, count ${step.count}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A number is even and divisible by three exactly when it is divisible by six. Only those numbers join the sum.</p>
    <p>The average is the sum divided by the count, rounded down; with no matches the answer is zero.</p>
  </>} />
}
