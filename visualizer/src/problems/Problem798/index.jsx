import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Empty difference array.' },
    { id: 'mark', label: 'Mark range', description: 'Record the rotations at which an element scores.' },
    { id: 'sweep', label: 'Sweep k', description: 'Accumulate the difference array into a score.' },
    { id: 'best', label: 'New best', description: 'A strictly higher score for this k.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest best k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/smallest-rotation-with-highest-score/',
  complexity: 'O(n) time, O(n) space. Visualization limited to 30 elements.',
  examples: [
    { label: 'Example A', input: '[2,3,1,4,0]' },
    { label: 'Example B', input: '[1,3,0,2,4]' },
    { label: 'Single element', input: '[0]' },
  ],
}
export default function SmallestRotationHighestScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.length
    const k = step.k >= 0 ? step.k : 0
    // Rotating right by k: position j holds nums[(j - k) mod n], and it scores when j >= that value.
    const at = j => run.input[(j - k + n) % n]
    return <>
      <IndexedSequence label="nums (original positions)" length={n} active={step.i} valueAt={i => run.input[i]} roleAt={i => (step.i >= 0 && i === step.i ? 'marking' : '')} />
      <IndexedSequence label={`Array after rotating by k = ${k} (scoring cells marked)`} length={n} active={-1} valueAt={j => at(j)}
        roleAt={j => (at(j) <= j ? 'scores' : 'no point')} />
      <IndexedSequence label="Difference array (index k)" length={n + 1} active={step.k} valueAt={i => step.diff[i] > 0 ? `+${step.diff[i]}` : step.diff[i]} roleAt={i => i === step.bestK && step.best >= 0 ? 'best' : ''} />
      <output aria-label="Score">{step.k >= 0 ? `Score at k = ${step.k}: ${step.score}. Best so far: ${step.best} at k = ${step.bestK}.` : 'Building ranges...'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After rotating by k, nums[i] sits at index (i - k) mod n and scores when that index is at least nums[i]. The valid k form one cyclic interval, so a prefix sum over a difference array yields every score in O(n) total.</p>
  </>} />
}
