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
    { label: 'Six values, k two', input: '{"nums":[4,-2,9,-7,3,1],"k":2}' },
    { label: 'Zeros and mirrored pair', input: '{"nums":[0,0,-5,5],"k":2}' },
    { label: 'Smallest input', input: '{"nums":[1,2],"k":1}' },
    { label: 'Equal values, no run', input: '{"nums":[5,5,5,5],"k":2}' },
    { label: 'Largest input, k = half', input: '{"nums":[-15,-22,-1,42,-4,10,33,-3,-2,7,-48,20,15,-49,-35,9,38,-19,-21,25,42,-35,38,-12,-6,21,-8,-47,25,-49,-26,-35,14,34,48,19,0,-27,42,-17],"k":20}' },
    { label: 'Long run: 40 values', input: '{"nums":[24,15,12,-47,-42,-23,-27,-48,-13,43,0,-26,38,27,-17,-31,-18,-3,3,-6,50,40,-50,-19,27,-31,-6,1,37,35,-4,20,20,-16,13,-16,-40,-26,32,-23],"k":10}' },
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
