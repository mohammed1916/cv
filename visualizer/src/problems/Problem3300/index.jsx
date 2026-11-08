import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No replacement has been computed yet.' },
    { id: 'digit', label: 'Digit sum', description: 'Add up the digits of this number and compare with the best so far.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest digit sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums array (JSON)',
  url: 'https://leetcode.com/problems/minimum-element-after-replacement-with-digit-sum/',
  complexity: 'O(n * d) time and O(1) extra space for n numbers with at most d digits.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,12,13,14]}' },
    { label: 'Example 3', input: '{"nums":[999,19,199]}' },
    { label: 'Single element', input: '{"nums":[7]}' },
    { label: 'Equal digit sums', input: '{"nums":[10,1,100]}' },
    { label: 'Largest allowed value', input: '{"nums":[10000,9999,1]}' },
    { label: 'Long run: 30 numbers', input: '{"nums":[2777,8576,8752,6462,6468,9561,8881,3724,7798,5830,1249,3924,7007,772,4263,1067,3259,9197,4647,5008,2086,2461,3693,8649,6108,1362,9695,496,466,5117]}' },
  ],
}

export default function DigitSumMinimum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digit sums" length={run.input.nums.length} active={step.index}
      valueAt={index => `${run.sums[index]}`}
      roleAt={index => (index < step.index ? 'seen' : '')} />
    <output aria-label="Best so far">{`Best so far: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each number is replaced by the sum of its digits, and the replacement is the only value that matters.</p>
    <p>The answer is the minimum over all replacements, so one pass that keeps the smallest value is enough.</p>
  </>} />
}
