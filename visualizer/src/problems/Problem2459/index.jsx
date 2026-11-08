import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CycleSlotView from './CycleSlotView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Targets', description: 'Two arrangements are accepted.' },
    { id: 'target', label: 'Target', description: 'Send each item to its slot for this arrangement.' },
    { id: 'cycle', label: 'Cycle', description: 'Price one cycle of the slot mapping.' },
    { id: 'keep', label: 'Keep', description: 'Compare the arrangement totals.' },
    { id: 'done', label: 'Result', description: 'Report the cheaper arrangement.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Permutation of 0 to n-1 (e.g. [4,2,0,3,1])',
  url: 'https://leetcode.com/problems/sort-array-by-moving-items-to-empty-space/',
  complexity: 'O(n) time and O(n) space for the cycle walk, run once per accepted arrangement. The visualization caps the input at 8 positions.',
  examples: [
    { label: 'Five slots', input: '[4,2,0,3,1]' },
    { label: 'Already zero last', input: '[1,2,3,0]' },
    { label: 'Swapped pairs', input: '[2,1,4,3,0]' },
    { label: 'Single slot', input: '[0]' },
    { label: 'Identity order', input: '[0,1,2,3]' },
    { label: 'Largest permutation', input: '[7,0,6,1,5,2,4,3]' },
    { label: 'Long run: 8 slots', input: '[2,1,0,4,6,5,3,7]' },
  ],
}

export default function SortByMovingItems() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CycleSlotView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each item must leave its current position for its target slot. Following those moves forms cycles; a cycle that includes the empty slot resolves with one fewer move than its length, and any other cycle needs one extra move to park the empty slot.</p>
  </>} />
}
