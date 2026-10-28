import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length', description: 'Arrays of length 1 or 2 need no check.' },
    { id: 'pair', label: 'Pairs', description: 'Look for an adjacent pair whose sum reaches m.' },
    { id: 'done', label: 'Complete', description: 'Report whether the split is possible.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (values 1 to 10) and integer m',
  url: 'https://leetcode.com/problems/check-if-it-is-possible-to-split-array/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at eight values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,2,1],"m":4}' },
    { label: 'Example 2', input: '{"nums":[2,1,3],"m":5}' },
  ],
}

export default function SplitArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (step.index >= 0 && (index === step.index || index === step.index + 1) ? 'pair' : '')} />
    <output aria-label="Result">{`Threshold ${run.input.m}${step.sum === undefined ? '' : `, last pair sum ${step.sum}`}: ${step.found === null ? 'checking' : step.found ? 'possible' : 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>A piece of length 1 can always stand alone. A longer piece must have a sum of at least m before it can be split off.</p>
    <p>If there are at least three values, the first split must leave a piece of two or more values, so one adjacent pair must reach m.</p>
  </>} />
}
