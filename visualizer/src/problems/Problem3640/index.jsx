import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the rising run at the first value.' },
    { id: 'scan', label: 'Scan index', description: 'Update the rising, falling and final-rising states at this index.' },
    { id: 'done', label: 'Complete', description: 'Report the largest trionic subarray sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/trionic-array-ii/',
  complexity: 'O(n) time and O(n) space for the state arrays.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,-2,-1,-3,0,2,-1]}' },
    { label: 'Example 2', input: '{"nums":[1,4,2,7]}' },
  ],
}

const label = v => (v === null ? '-' : String(v))

export default function TrionicSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.nums.length} active={step.index}
      valueAt={index => run.nums[index]}
      roleAt={index => (index < step.index ? 'done' : '')} />
    <output aria-label="State at index">{step.index < 0 ? 'Start' : `Index ${step.index}: rising ${label(step.run)}, falling ${label(step.fall)}, final rising ${label(step.climb)}, best ${label(step.best)}`}</output>
  </>} renderReasoning={() => <>
    <p>A trionic subarray rises, falls, then rises again, with each part strictly monotone and sharing its turning points.</p>
    <p>Keeping the best sum for each state at each index means every subarray is considered without enumerating them.</p>
  </>} />
}
