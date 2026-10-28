import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with no maximum and a score of zero.' },
    { id: 'scan', label: 'Scan', description: 'Update the maximum, convert the value, and add it to the score.' },
    { id: 'done', label: 'Complete', description: 'Report the score of every prefix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums: 1 to 12 integers from 1 to 10',
  url: 'https://leetcode.com/problems/find-the-score-of-all-prefixes-of-an-array/',
  complexity: 'O(n) time and O(n) space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,7,5,10]}' },
    { label: 'Single', input: '{"nums":[5]}' },
  ],
}

export default function ScoreOfAllPrefixes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => index <= step.index ? 'in prefix' : ''} />
    <output aria-label="Running maximum">{`Running maximum ${step.runningMax}${step.conver === null || step.conver === undefined ? '' : `, converted value ${step.conver}`}`}</output>
    <output aria-label="Prefix scores">{`Prefix scores: ${step.answer.length ? step.answer.join(', ') : '(none yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>The converted value of each element depends only on the running maximum, which can be updated as the scan moves right.</p>
    <p>Each prefix score is the previous score plus one converted value, so every answer is ready as soon as its element is reached.</p>
  </>} />
}
