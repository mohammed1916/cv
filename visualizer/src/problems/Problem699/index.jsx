import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty street', description: 'No squares have landed.' },
    { id: 'drop', label: 'Drop a square', description: 'Find the tallest square it overlaps, then stack on top.' },
    { id: 'done', label: 'Skyline', description: 'The tallest height after every drop.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Squares (JSON array of [left, side] pairs)',
  url: 'https://leetcode.com/problems/falling-squares/',
  complexity: 'O(n²) time for n squares with this direct overlap scan, and O(n) space.',
  examples: [
    { label: 'Stacked', input: '[[1,2],[2,3],[6,1]]' },
    { label: 'Side by side', input: '[[4,5],[9,3],[12,2]]' },
    { label: 'Nested', input: '[[1,4],[2,1]]' },
  ],
}

export default function FallingSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const intervals = step.placed.map(s => ({
      start: s.left, end: s.right, group: 'street', label: `h${s.height}`,
      role: step.index !== null && s.index === step.index ? 'current' : 'kept',
    }))
    return <>
      <IntervalView title="Squares on the number line" intervals={intervals} note={`Tallest so far: ${step.best}`} />
      <RecordStateTable label="Heights" columns={['square', 'height']}
        rows={step.placed.map(s => ({ square: s.index + 1, height: s.height }))} activeRow={step.placed.length - 1} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the overlap test:</strong> two squares rest on each other only when their horizontal spans share some width, so only overlapping squares set the base.</p>
  </>} />
}
