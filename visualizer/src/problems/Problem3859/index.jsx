import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'The count starts at zero.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value to the window.' },
    { id: 'count', label: 'Count', description: 'The window has k values and each appears m times or more.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, k and m',
  url: 'https://leetcode.com/problems/count-subarrays-with-k-distinct-integers/',
  complexity: 'Each start extends to the right, so the visual costs O(n^2) with small counts. The visual caps the array at 12 values.',
  examples: [
    { label: 'Example', input: '{"nums":[4,4,1,4,1],"k":2,"m":2}' },
    { label: 'Repeats', input: '{"nums":[1,1,1],"k":1,"m":2}' },
    { label: 'Single value', input: '{"nums":[5],"k":1,"m":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":1,"m":4}' },
    { label: 'Largest limits', input: '{"nums":[9,9,9,9,9,9,9,9,9,9,9,9],"k":9,"m":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[2,3,9,9,5,6,5,4,3,8,5,4],"k":4,"m":5}' },
    { label: 'No window has enough kinds', input: '{"nums":[1,2],"k":9,"m":1}' },
  ],
}

export default function CountSubarraysWithKDistinctIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.r ?? -1}
      roleAt={i => (step.l === null ? '' : i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? (step.ok ? 'valid' : 'window') : '')} />
    <output aria-label="Window counts">{step.l === null ? `Valid subarrays so far: ${step.count}` : `Window ${step.l} to ${step.r}: ${step.freq.map(([v, c]) => `${v} x${c}`).join(', ')} · total ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>For each start, the window grows to the right and the program keeps a count for every value inside it.</p>
    <p>A window scores when its distinct count reaches k and none of those values shows up fewer than m times.</p>
  </>} />
}
