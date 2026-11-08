import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and zero bit counts.' },
    { id: 'add', label: 'Extend', description: 'Add the next value on the right.' },
    { id: 'record', label: 'Record', description: 'The window OR reaches k, so its length is a candidate.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop the leftmost value and keep searching.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest length, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 30 values, 1 to 255) and k (1 to 255), e.g. {"nums":[1,2,3],"k":2}',
  url: 'https://leetcode.com/problems/shortest-subarray-with-or-at-least-k-ii/',
  complexity: 'O(n * log V) time and O(log V) space for the bit counts. The visualization caps the input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[2,1,8],"k":10}' },
    { label: "Single value", input: "{\"nums\":[1],\"k\":1}" },
    { label: "Equal values", input: "{\"nums\":[3,3,3],\"k\":3}" },
    { label: "Largest values and k", input: "{\"nums\":[255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255],\"k\":255}" },
    { label: "Long run: 30 values", input: "{\"nums\":[78,47,61,37,51,24,124,5,41,229,210,185,231,250,126,211,45,75,51,24,165,80,57,114,224,140,159,200,32,205],\"k\":69}" },
  ],
}

export default function ShortestSubarrayOrII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const roleOf = i => (step.left <= i && i <= step.right ? 'window' : '')
    return <>
      <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={Math.max(step.right, 0)} roleAt={roleOf} />
      <output aria-label="Window OR">{`Window ${step.left}-${step.right}, OR ${step.windowOr}, k ${run.input.k}, best ${step.best ?? 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>For each right end, the window OR only grows as the window widens, so once it reaches k the left end can move right to look for a shorter window.</p>
    <p>Per-bit counts let the window remove a value on the left without recomputing the OR, since a bit stays set while any value in the window still has it.</p>
  </>} />
}
