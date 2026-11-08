import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Split the array into strictly increasing runs.' },
    { id: 'run', label: 'Run', description: 'Record the length of one run.' },
    { id: 'half', label: 'Half', description: 'Both halves of one run are increasing.' },
    { id: 'pair', label: 'Pair', description: 'Two neighboring runs meet.' },
    { id: 'done', label: 'Result', description: 'Report the best k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers)',
  url: 'https://leetcode.com/problems/adjacent-increasing-subarrays-detection-ii/',
  complexity: 'O(n) time and O(n) space for the run lengths.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,6,1,2,5,9,3]}' },
    { label: 'Example 2', input: '{"nums":[3,3,1,2,4,2,5,6]}' },
    { label: 'Smallest input', input: '{"nums":[1,2]}' },
    { label: 'Equal values', input: '{"nums":[7,7]}' },
    { label: 'Extreme values', input: '{"nums":[-100,100,-100,100]}' },
    { label: 'Long run: 30 values', input: '{"nums":[-26,-63,-13,-35,15,-84,25,56,57,-47,35,32,50,1,-50,78,83,74,-25,-98,-8,85,62,-25,48,-55,27,20,60,-91]}' },
  ],
}

export default function AdjacentIncreasingSubarraysDetectionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.focus.length ? step.focus[0][0] : -1}
      roleAt={i => {
        const block = step.focus.find(([a, b]) => i >= a && i < b)
        if (!block) return ''
        return i === block[0] ? 'l' : i === block[1] - 1 ? 'r' : 'run'
      }} />
    <output aria-label="Best k">{`best k so far: ${step.best}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A pair of adjacent subarrays of length k is two increasing blocks of length k placed side by side.</p>
    <p>Both blocks lie inside increasing runs. Either both come from one run, which gives length divided by two, or they straddle a boundary between neighboring runs, which gives the smaller run length.</p>
  </>} />
}
