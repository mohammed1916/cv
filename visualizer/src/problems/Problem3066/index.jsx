import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the numbers; the smallest sits at the front of the heap.' },
    { id: 'combine', label: 'Combine', description: 'Remove the two smallest numbers and push twice the smaller plus the larger.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": threshold}',
  url: 'https://leetcode.com/problems/minimum-operations-to-exceed-threshold-value-ii/',
  complexity: 'O(n log n + ops log n) time with a min heap. The visualization caps input at 8 numbers and threshold 30.',
  examples: [
    { label: 'Four values, k six', input: '{"nums":[9,4,7,1],"k":6}' },
    { label: 'Three values, k twelve', input: '{"nums":[6,13,25],"k":12}' },
    { label: 'Equal values', input: '{"nums":[4,4,4],"k":4}' },
    { label: 'Two values', input: '{"nums":[2,2],"k":2}' },
    { label: 'Largest values', input: '{"nums":[30,29,28,27,26,25,24,23],"k":30}' },
    { label: 'Long run: 8 values', input: '{"nums":[16,11,24,7,16,11,22,25],"k":1}' },
  ],
}

export default function ThresholdOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in the heap (sorted)" length={step.values.length} valueAt={i => step.values[i]}
      roleAt={i => (step.pair.includes(step.values[i]) ? 'combining' : step.values[i] >= run.input.k ? 'done' : '')} />
    <output aria-label="Operations">{`Operations so far: ${step.ops}`}</output>
  </>} renderReasoning={() => <>
    <p>The smallest number is the only one that can fall below the threshold, so each operation combines the two smallest.</p>
    <p>The result 2x + y is at least as large as both inputs, so the numbers left below the threshold keep shrinking until none remain.</p>
  </>} />
}
