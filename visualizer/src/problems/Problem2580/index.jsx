import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python, viewFor } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the ranges by their left end.' },
    { id: 'new', label: 'New component', description: 'A range that starts after the current component ends.' },
    { id: 'join', label: 'Join', description: 'A range that shares a point with the current component.' },
    { id: 'done', label: 'Complete', description: 'Report 2 to the power of the component count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Ranges as JSON [[left, right], ...] (0 to 20)',
  url: 'https://leetcode.com/problems/count-ways-to-group-overlapping-ranges/',
  complexity: 'O(n log n) time from the sort, O(n) space. The visualization caps input at 10 ranges.',
  examples: [
    { label: 'Two ranges', input: '[[6,10],[5,15]]' },
    { label: 'Touching', input: '[[1,3],[3,5]]' },
  ],
}

export default function CountWaysOverlappingRanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const view = viewFor(run, step)
    return <>
      {view && <IntervalView {...view} />}
      <output aria-label="Components">{`Components so far: ${step.groups}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two ranges that share at least one number must be in the same group, so they form one component together.</p>
    <p>Each component can go into either group independently, which gives 2 raised to the number of components.</p>
  </>} />
}
