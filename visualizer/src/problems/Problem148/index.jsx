import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '148',
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List values (JSON array of integers)',
  url: 'https://leetcode.com/problems/sort-list/',
  complexity: 'O(n log n) time and O(log n) recursion stack, because the list is split in halves and merged without copying nodes. The visualization caps the list at 32 values.',
  examples: [
    { label: 'Mixed', input: '[9,-3,5,0,7,2]' },
    { label: 'Duplicates', input: '[4,4,1,4]' },
    { label: 'Empty', input: '[]' },
    { label: 'Equal values keep one sorted block', input: '[5,5,5,5]' },
    { label: 'Extreme values at the limits', input: '[100000,-100000,0,100000,-100000]' },
    { label: 'Three values with a tie', input: '[2,-1,2]' },
    { label: 'Long run: 32 values', input: '[-6595,-10730,20285,77015,86323,-92884,92173,-52213,83996,-51994,-70803,21871,10454,-62103,-42524,-46286,-20060,-92090,91709,28614,-61382,-94675,71906,58975,59608,-2254,11253,-74721,19458,36049,-91766,-47574]' },
  ],
}

export default function SortListVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title={step.phase === 'merge' ? 'Left run' : 'Current list'} items={(step.phase === 'merge' ? step.scene.left : step.scene.segment)?.map(String) || []}
      note={step.scene.slow !== null && step.scene.slow !== undefined ? `slow at ${step.scene.slow}, fast at ${step.scene.fast}` : undefined} />
    {step.phase === 'merge' && <StackLane title="Right run" items={step.scene.right.map(String)} />}
    {step.phase === 'merge' || step.phase === 'done' ? <StackLane title="Merged so far" items={(step.scene.merged || []).map(String)} /> : null}
  </>} renderReasoning={({ step }) => <>
    <p>Splitting halves the list at each level, and merging two sorted runs needs only their front nodes, so the work stays O(n) per level.</p>
    <p>{step.message}</p>
  </>} />
}
