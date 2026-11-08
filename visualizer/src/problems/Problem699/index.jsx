import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Single square', input: '[[5,3]]' },
    { label: 'Same square twice', input: '[[1,2],[1,2]]' },
    { label: 'Largest values allowed', input: '[[100000000,1000000]]' },
    { label: 'Long run: 40 squares', input: '[[5070,35],[4307,28],[2440,14],[6387,2],[997,37],[9510,22],[4399,11],[6071,16],[7626,47],[944,26],[5947,48],[8930,19],[735,5],[9132,40],[5404,32],[782,23],[7263,13],[7557,32],[3548,38],[9910,50],[2438,47],[7451,43],[2308,28],[5908,3],[5030,2],[5702,9],[1579,41],[1657,1],[734,5],[5893,23],[4165,19],[8417,2],[3667,20],[2457,5],[8844,2],[4054,46],[6004,19],[7965,31],[1563,5],[4386,34]]' },
  ],
}

export default function FallingSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const intervals = step.placed.map(s => ({
      start: s.left, end: s.right, group: 'street', label: `h${s.height}`,
      role: step.index !== null && s.index === step.index ? 'current' : 'kept',
    }))
    return <>
      <IndexedSequence label="Squares in input order" length={run.input.length} valueAt={k => `[${run.input[k][0]}, ${run.input[k][0] + run.input[k][1]})`} active={step.index ?? -1} />
      <IntervalView title="Squares on the number line" intervals={intervals} note={`Tallest so far: ${step.best}`} />
      <RecordStateTable label="Heights" columns={['square', 'height']}
        rows={step.placed.map(s => ({ square: s.index + 1, height: s.height }))} activeRow={step.placed.length - 1} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the overlap test:</strong> two squares rest on each other only when their horizontal spans share some width, so only overlapping squares set the base.</p>
  </>} />
}
