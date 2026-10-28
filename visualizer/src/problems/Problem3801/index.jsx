import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Singles', description: 'A single list costs nothing.' },
    { id: 'combine', label: 'Combine', description: 'Test one split of a group of lists into two parts.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted lists (JSON object with lists)',
  url: 'https://leetcode.com/problems/minimum-cost-to-merge-sorted-lists/',
  complexity: 'O(3^m * L) time for m lists over subsets. The visualization caps lists at 4.',
  examples: [
    { label: 'Example 1', input: '{"lists":[[1,3,5],[2,4],[6,7,8]]}' },
    { label: 'Example 2', input: '{"lists":[[1,1,5],[1,4,7,8]]}' },
  ],
}

export default function MinimumCostToMergeSortedLists() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Elements" length={run.values.length} valueAt={i => run.values[i]} active={-1}
      roleAt={i => {
        const bit = 1 << run.owner[i]
        if (step.sub & bit) return 'part A'
        if (step.other & bit) return 'part B'
        return ''
      }} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The median of a merged list is the left middle of all its values, so a group of lists always has the same median regardless of merge order.</p>
  </>} />
}
