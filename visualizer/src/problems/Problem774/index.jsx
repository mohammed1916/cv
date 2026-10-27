import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bracket', description: 'The answer is between 0 and the largest gap.' },
    { id: 'check', label: 'Test a limit', description: 'Count the stations needed if no gap may exceed the limit.' },
    { id: 'done', label: 'Converged', description: 'The smallest feasible limit is found.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Station positions and k (JSON)',
  url: 'https://leetcode.com/problems/minimize-max-distance-to-gas-station/',
  complexity: 'O(n log(range / precision)) time. The visualization caps input at 20 stations and runs a fixed 50 iterations.',
  examples: [
    { label: 'Example 1', input: '{"stations":[1,2,3,4,5,6,7,8,9,10],"k":9}' },
    { label: 'Example 2', input: '{"stations":[23,24,36,39,46,56,57,65,84,98],"k":1}' },
  ],
}

export default function MinimizeMaxDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Gaps between stations" length={run.gaps.length} valueAt={i => run.gaps[i]} />
    <output aria-label="Limit">
      {`Limit range [${step.lo.toFixed(4)}, ${step.hi.toFixed(4)}]`}
      {step.mid !== null && `, testing ${step.mid.toFixed(4)}: ${step.feasible ? 'feasible' : 'not feasible'}`}
    </output>
  </>} renderReasoning={() => <>
    <p>For a fixed limit, a gap of length g needs ceil(g / limit) - 1 new stations. If the total is at most k, the limit is achievable, and a smaller one may be too.</p>
    <p>Binary search on the limit narrows the answer to the smallest achievable value.</p>
  </>} />
}
