import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Distance range', description: 'The answer lies between 0 and the largest gap.' },
    { id: 'count', label: 'Count pairs', description: 'Count pairs within the midpoint distance.' },
    { id: 'done', label: 'Complete', description: 'The search has converged.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/find-k-th-smallest-pair-distance/',
  complexity: 'O(n log n + n · log W) time, where W is the value range, and O(1) extra space after sorting.',
  examples: [
    { label: 'Classic', input: '{"nums":[1,3,1],"k":1}' },
    { label: 'Spread', input: '{"nums":[1,6,1],"k":3}' },
  ],
}

export default function KthPairDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Search state">Distance range [{step.lo}, {step.hi}]{step.mid !== null && step.mid !== undefined ? ` · mid ${step.mid} · ${step.count} pairs ≤ mid (k = ${run.input.k})` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Monotone count:</strong> the number of pairs within distance d only grows with d, so the smallest d reaching k pairs is the answer.</p>
    <p>{run.input.nums.length} values, sorted first.</p>
  </>} />
}
