import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the intervals by start time.' },
    { id: 'assign', label: 'Assign', description: 'Place the interval in the earliest-finishing free group, or open a new group.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals [left, right] (JSON)',
  url: 'https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/',
  complexity: 'O(n log n) time. The visualization caps input at 10 intervals with endpoints up to 30.',
  examples: [
    { label: 'Example 1', input: '{"intervals":[[5,10],[6,8],[1,5],[2,3],[1,10]]}' },
    { label: 'Example 2', input: '{"intervals":[[1,3],[5,6],[8,10],[11,13]]}' },
  ],
}

export default function IntervalGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Intervals in sorted order" length={run.sorted.length} active={step.index}
      valueAt={i => `[${run.sorted[i][0]}, ${run.sorted[i][1]}]`} />
    <IndexedSequence label="Groups (last end time)" length={step.ends.length} active={step.group}
      valueAt={i => step.ends[i]} roleAt={i => `group ${i + 1}`} />
    <output aria-label="Groups">{`Groups open: ${step.ends.length}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Intervals in the same group must not overlap, so each group behaves like a timeline. Reusing the earliest-finishing free group is always at least as good as any other choice.</p>
  </>} />
}
