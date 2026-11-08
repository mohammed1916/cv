import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3907View from './Problem3907View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Empty shelves for the two parities.' },
    { id: 'scan', label: 'Scan', description: 'Visit the next index from the right.' },
    { id: 'count', label: 'Count', description: 'Count smaller values on the opposite shelf.' },
    { id: 'insert', label: 'Shelve', description: 'Add the value to its own shelf in order.' },
    { id: 'done', label: 'Result', description: 'Report the counts in index order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from -9 to 9)',
  url: 'https://leetcode.com/problems/count-smaller-elements-with-opposite-parity/',
  complexity: 'O(n^2) time in the simple shelf version used here, with O(n) space. Each index is inserted into a sorted shelf and counted with one binary search. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Mixed parities', input: '{"nums":[4,3,2,7,1]}' },
    { label: 'Negatives', input: '{"nums":[-3,-2,5,0,-7,8]}' },
    { label: 'Single element', input: '{"nums":[5]}' },
    { label: 'Equal values count nothing', input: '{"nums":[2,2,2,2]}' },
    { label: 'Extreme values at the limits', input: '{"nums":[9,-9,8,-8,0,1,-1,9,-9,0,5,-5]}' },
    { label: 'Long run: 12 items', input: '{"nums":[1,-7,-4,4,2,7,-4,-2,8,2,-4,-3]}' },
  ],
}

export default function Problem3907Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3907View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Scanning from the right means every value already on a shelf sits at a later index, so the count is only a search on the opposite shelf.</p>
  </>} />
}
