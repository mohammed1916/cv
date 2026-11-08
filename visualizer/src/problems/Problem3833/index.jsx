import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3833,
  phases: [
    { id: 'scan', label: 'Scan', description: 'Walk from the right, comparing each value with the average of its suffix.' },
    { id: 'done', label: 'Result', description: 'Report the count of dominant indices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (positive integers)',
  url: 'https://leetcode.com/problems/count-dominant-indices/',
  complexity: 'O(n) time and O(1) extra space: one pass with a running suffix sum.',
  examples: [
    { label: 'Decreasing', input: '{"nums":[6,4,3]}' },
    { label: 'Spike', input: '{"nums":[1,9,2,2]}' },
    { label: 'One value', input: '{"nums":[4]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5]}' },
    { label: 'Largest values alternate', input: '{"nums":[30,1,30,1,30,1,30,1,30,1,30,1]}' },
    { label: 'Long run: 12 values', input: '{"nums":[24,18,1,3,4,1,3,1,15,21,23,3]}' },
  ],
}

export default function CountDominantIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (i > step.at && step.at >= 0 ? 'suffix' : '')} />
    <output aria-label="Suffix check">{step.at >= 0
      ? `suffix sum ${step.suffix} over ${step.length} later element${step.length === 1 ? '' : 's'}; count ${step.count}`
      : `count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Multiplying the average comparison by the number of later elements removes the division, so the test uses whole numbers only.</p>
    <p>Moving leftward, the suffix sum grows by one element per step, so each check costs constant time.</p>
  </>} />
}
