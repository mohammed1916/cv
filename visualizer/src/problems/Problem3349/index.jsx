import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the first possible start index.' },
    { id: 'check', label: 'Check pair', description: 'Test the two neighboring runs starting here.' },
    { id: 'done', label: 'Complete', description: 'Report whether a pair was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/adjacent-increasing-subarrays-detection-i/',
  complexity: 'O(n * k) time and O(1) extra space. Checking each run once gives O(n) with prefix run lengths.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,5,7,8,9,2,3,4,3,1],"k":3}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,4,4,4,4,5,6,7],"k":5}' },
  ],
}

export default function AdjacentRuns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { k } = run.input
    const inFirst = index => step.start >= 0 && index >= step.start && index < step.start + k
    const inSecond = index => step.start >= 0 && index >= step.start + k && index < step.start + 2 * k
    return <>
      <IndexedSequence label="Numbers" length={run.input.nums.length} active={step.start < 0 ? -1 : step.start}
        valueAt={index => run.input.nums[index]}
        roleAt={index => (inFirst(index) ? 'first run' : inSecond(index) ? 'second run' : '')} />
      <output aria-label="Pair result">{step.start < 0 ? 'Searching' : `Start ${step.start}: first run ${step.first ? 'increases' : 'does not'}, second run ${step.second ? 'increases' : 'does not'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two adjacent runs of length k share no elements, so the second run starts exactly k places after the first.</p>
    <p>A run is strictly increasing when each element is less than the next one, so one check per window is enough.</p>
  </>} />
}
