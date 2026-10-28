import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up the whole array once.' },
    { id: 'scan', label: 'Splits', description: 'Compare the floored averages of the two sides of each split.' },
    { id: 'done', label: 'Complete', description: 'Report the index with the smallest difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums: 1 to 12 integers from 0 to 20',
  url: 'https://leetcode.com/problems/minimum-average-difference/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,5,3,9,5,3]}' },
    { label: 'Single', input: '{"nums":[0]}' },
  ],
}

export default function MinimumAverageDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => index === step.bestIndex && step.best !== null ? 'best split' : index < step.index ? 'left' : index > step.index ? 'right' : ''} />
    <output aria-label="Averages">{step.leftAvg === null || step.leftAvg === undefined ? 'Averages appear once a split is checked' : `Left average ${step.leftAvg}, right average ${step.rightAvg}, difference ${step.diff}`}</output>
    <output aria-label="Best split">{step.best === null ? 'Best split: none yet' : `Best split: index ${step.bestIndex} with difference ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each split is compared using a running left sum, and the right sum is the total minus the left sum, so no slice is ever rebuilt.</p>
    <p>Averages are rounded down, and an empty right side counts as 0. Ties keep the earlier index because only a strictly smaller difference replaces the best.</p>
  </>} />
}
