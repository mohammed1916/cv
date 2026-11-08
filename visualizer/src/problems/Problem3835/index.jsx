import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been counted yet.' },
    { id: 'left', label: 'Left end', description: 'Fix the left index and grow the right index.' },
    { id: 'count', label: 'Within limit', description: 'This subarray costs at most k, so count it.' },
    { id: 'skip', label: 'Over limit', description: 'This subarray costs more than k.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and limit (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/count-subarrays-with-cost-less-than-or-equal-to-k/',
  complexity: 'O(n^2) time for this teaching version. The visualization caps input at 20 values.',
  examples: [
    { label: 'Four values, k six', input: '{"nums":[12,5,20,8],"k":6}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"k":0}' },
    { label: 'One value, k zero', input: '{"nums":[1],"k":0}' },
    { label: 'Equal pair, k zero', input: '{"nums":[7,7],"k":0}' },
    { label: 'Largest values', input: '{"nums":[1000000000,1000000000,1],"k":1000000000}' },
    { label: 'Long run: 20 values', input: '{"nums":[185119286,213551069,402097829,707053803,236474572,988432937,2068258,777751354,526443810,795109289,892701865,204816443,827244642,477716128,18347666,896874652,913438549,320493039,47244311,49938544],"k":831922688}' },
  ],
}

export default function CountCostSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.left >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Count">{`Subarray [${step.left}..${step.right}], cost ${step.cost ?? '-'}, count ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Cost is (largest minus smallest) times the length. Extending the right end can only keep or raise the spread, so the scan records each subarray that fits.</p>
  </>} />
}
