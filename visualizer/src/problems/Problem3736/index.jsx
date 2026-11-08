import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Target', description: 'Find the largest value; it is the level everything climbs to.' },
    { id: 'raise', label: 'Raise', description: 'Add the gap between the target and this value.' },
    { id: 'done', label: 'Result', description: 'Report the accumulated moves.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers (1 to 12 values, each from 1 to 100)',
  url: 'https://leetcode.com/problems/minimum-moves-to-equal-array-elements-iii/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '[3,7,4]' },
    { label: 'Equal values', input: '[2,2,8,5]' },
    { label: 'Single value', input: '[9]' },
    { label: 'Equal values', input: '[4,4,4,4]' },
    { label: 'Extreme values', input: '[100,1,100,1,100,1,100,1,100,1,100,1]' },
    { label: 'Long run: 12 values', input: '[28,99,62,53,24,55,22,25,44,31,74,89]' },
  ],
}

export default function MinimumMovesToEqualArrayElementsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (i === step.at ? 'window' : '')} />
    <output aria-label="Climb check">{`target ${step.target}, total moves ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Only increases are allowed, so the final level must be at least the largest value. Reaching the largest value itself is the cheapest choice.</p>
    <p>Each value therefore costs exactly the difference from the largest, and the total is the sum of those differences.</p>
  </>} />
}
