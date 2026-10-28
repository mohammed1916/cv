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
    { label: 'Example 1', input: '{"target":[5,1,3],"arr":[9,4,2,3,4]}' },
    { label: 'Example 2', input: '{"target":[6,4,8,1,3,2],"arr":[4,7,6,2,3,8,6,1]}' },
  ],
}

export default function MinimumOperationsSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.item} />
    <IndexedSequence label="Run ends (target positions)" length={step.tails.length} valueAt={i => step.tails[i]} />
    <output aria-label="Runs">{`Longest run so far: ${step.tails.length} of ${run.input.target.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Only values that appear in target matter, and they must keep their target order to form a subsequence.</p>
    <p>The longest strictly increasing run of target positions is the most of target that can already be kept, so the rest must be inserted.</p>
  </>} />
}
