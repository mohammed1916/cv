import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Empty difference array.' },
    { id: 'mark', label: 'Mark range', description: 'Record the rotations at which an element scores.' },
    { id: 'sweep', label: 'Sweep k', description: 'Accumulate the difference array into a score.' },
    { id: 'best', label: 'New best', description: 'A strictly higher score for this k.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest best k.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/smallest-rotation-with-highest-score/',
  complexity: 'O(n) time, O(n) space. Visualization limited to 30 elements.',
  examples: [
    { label: '[2,3,1,4,0] -> 3', input: '[2,3,1,4,0]' },
    { label: '[1,3,0,2,4] -> 0', input: '[1,3,0,2,4]' },
    { label: 'Single element', input: '[0]' },
  ],
}
export default function SmallestRotationHighestScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} active={step.i} valueAt={i => run.input[i]} />
    <IndexedSequence label="Difference array (index k)" length={run.input.length + 1} active={step.k} valueAt={i => step.diff[i] > 0 ? `+${step.diff[i]}` : step.diff[i]} roleAt={i => i === step.bestK && step.best >= 0 ? 'best' : ''} />
    <output aria-label="Score">{step.k >= 0 ? `Score at k = ${step.k}: ${step.score}. Best so far: ${step.best} at k = ${step.bestK}.` : 'Building ranges...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After rotating by k, nums[i] sits at index (i - k) mod n and scores when that index is at least nums[i]. The valid k form one cyclic interval, so a prefix sum over a difference array yields every score in O(n) total.</p>
  </>} />
}
