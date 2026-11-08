import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Single point range', input: '[[0,0]]' },
    { label: 'Equal ranges', input: '[[5,5],[5,5]]' },
    { label: 'Full span and edges', input: '[[0,20],[0,0],[20,20],[10,10]]' },
    { label: 'Long run: ten ranges', input: '[[4,12],[5,8],[5,10],[8,11],[0,19],[15,17],[11,19],[19,19],[4,17],[9,17]]' },
  ],
}

export default function CountWaysOverlappingRanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const view = viewFor(run, step)
    return <>
      <IndexedSequence label="Ranges" length={run.input.length} valueAt={i => JSON.stringify(run.input[i])} active={step.index ?? -1} />
      {view && <IntervalView {...view} />}
      <output aria-label="Components">{`Components so far: ${step.groups}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two ranges that share at least one number must be in the same group, so they form one component together.</p>
    <p>Each component can go into either group independently, which gives 2 raised to the number of components.</p>
  </>} />
}
