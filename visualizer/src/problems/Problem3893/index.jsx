import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3893View from './Problem3893View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Start with no team.' },
    { id: 'centre', label: 'Centre', description: 'Pick an interval as the team centre.' },
    { id: 'hit', label: 'Overlap', description: 'This interval shares a point with the centre.' },
    { id: 'miss', label: 'Miss', description: 'This interval does not touch the centre.' },
    { id: 'best', label: 'Best', description: 'This team beats the best so far.' },
    { id: 'done', label: 'Result', description: 'Report the largest team.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with intervals ([start, end] pairs with integers 0 to 20)',
  url: 'https://leetcode.com/problems/maximum-team-size-with-overlapping-intervals/',
  complexity: 'O(n^2) time and O(1) extra space for n intervals: every interval is tried as the centre against every other. The visualization caps the list at 12 intervals.',
  examples: [
    { label: 'Chain of overlaps', input: '{"intervals":[[1,4],[2,3],[4,6],[7,9],[5,8]]}' },
    { label: 'Touching endpoints', input: '{"intervals":[[0,0],[0,0],[1,1]]}' },
    { label: 'Single point interval', input: '{"intervals":[[3,3]]}' },
    { label: 'Nested intervals', input: '{"intervals":[[0,20],[5,10],[10,15]]}' },
    { label: 'Full range and points', input: '{"intervals":[[20,20],[0,0],[0,20]]}' },
    { label: 'Long run: 12 intervals', input: '{"intervals":[[5,20],[2,5],[4,20],[18,19],[8,10],[11,19],[5,11],[0,18],[3,13],[5,15],[2,14],[13,15]]}' },
  ],
}

export default function Problem3893Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3893View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Endpoints count as contact, so intervals [a, b] and [c, d] overlap exactly when the larger start is at most the smaller end.</p>
  </>} />
}
