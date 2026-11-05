import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Copy the array and count zero operations.' },
    { id: 'check', label: 'Check', description: 'Look for an adjacent decrease.' },
    { id: 'pick', label: 'Pick pair', description: 'Track the adjacent pair with the smallest sum.' },
    { id: 'scan', label: 'Scan', description: 'Compare the next adjacent pair.' },
    { id: 'merge', label: 'Merge', description: 'Replace the chosen pair with its sum.' },
    { id: 'done', label: 'Result', description: 'Report the number of merges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers (1 to 12 entries)',
  url: 'https://leetcode.com/problems/minimum-pair-removal-to-sort-array-i/',
  complexity: 'O(n^2) time with this direct simulation and O(n) extra space. The visualization caps the input at 12 values.',
  examples: [
    { label: 'Descending start', input: '[6,1,4,2]' },
    { label: 'Already sorted', input: '[1,2,2]' },
    { label: 'Zero at the end', input: '[8,2,7,0]' },
  ],
}

export default function MinimumPairRemovalToSortArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="array" length={step.arr.length} valueAt={i => step.arr[i]} active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.pair && step.pair[0] === i ? 'l' : step.pair && step.pair[1] === i ? 'r' : '')} />
    <output aria-label="Operations">{`operations = ${step.operations}${step.phase === 'done' ? ', sorted' : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Each merge replaces an adjacent pair with its sum. Choosing the smallest sum, leftmost on ties, is the rule the problem asks for, so the simulation follows it exactly.</p>
    <p>The loop stops as soon as no adjacent pair decreases, which is the non-decreasing condition.</p>
  </>} />
}
