import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Map each target value to its position.' },
    { id: 'skip', label: 'Skip', description: 'A value missing from target cannot be part of the subsequence.' },
    { id: 'place', label: 'Place', description: 'Extend or tighten the run that ends at this target position.' },
    { id: 'done', label: 'Complete', description: 'Subtract the longest run from the target length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"target": [...distinct], "arr": [...]}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-a-subsequence/',
  complexity: 'Longest increasing subsequence over target positions with binary search: O(n log m). The visualization caps target at 8 and arr at 10.',
  examples: [
    { label: 'Own case 1', input: '{"target":[6,2,4],"arr":[10,5,3,4,5]}' },
    { label: 'Own case 2', input: '{"target":[7,5,9,2,4,3],"arr":[5,8,7,3,4,9,7,2]}' },
  { label: 'Single target value', input: '{"target":[4],"arr":[4]}' },
  { label: 'Target value absent', input: '{"target":[7],"arr":[1,2,3]}' },
  { label: 'Repeated values in arr', input: '{"target":[3,5],"arr":[5,5,3,3,10,10]}' },
  { label: 'Long run: 8 targets, 10 values', input: '{"target":[4,2,8,5,3,7,1,10],"arr":[10,1,9,10,4,2,10,1,4,9]}' },
  ],
}

export default function MinimumOperationsSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const searching = step.lo !== null && step.lo !== undefined
    // The search for the first run whose end is at least this position: l and r bound it, mid is tested.
    const roleAt = index => {
      if (index === step.lo) return 'l'
      if (index === step.hi) return 'r'
      return index === step.mid ? 'mid' : ''
    }
    return <>
      <IndexedSequence label="arr" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.item} />
      <IndexedSequence label="Run ends (target positions)" length={step.tails.length + (searching ? 1 : 0)}
        valueAt={i => (i < step.tails.length ? step.tails[i] : 'new')} roleAt={roleAt} />
      <output aria-label="Runs">{`Longest run so far: ${step.tails.length} of ${run.input.target.length}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only values that appear in target matter, and they must keep their target order to form a subsequence.</p>
    <p>The longest strictly increasing run of target positions is the most of target that can already be kept, so the rest must be inserted.</p>
  </>} />
}
