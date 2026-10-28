import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the stones so the ends are clear.' },
    { id: 'minimum', label: 'Minimum', description: 'Count the moves needed to make the stones consecutive, fewest first.' },
    { id: 'maximum', label: 'Maximum', description: 'Count the empty spots between the stones; each move fills one.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum and maximum move counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with three distinct stone positions a, b and c (1 to 30)',
  url: 'https://leetcode.com/problems/moving-stones-until-consecutive/',
  complexity: 'O(1) time and space: a few comparisons on three sorted positions.',
  examples: [
    { label: 'Example 1', input: '{"a":1,"b":2,"c":5}' },
    { label: 'Example 2', input: '{"a":4,"b":3,"c":2}' },
  ],
}

export default function MovingStones() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const [lo, hi] = [Math.min(...step.stones), Math.max(...step.stones)]
    return <>
      <IndexedSequence label={`Positions ${lo} to ${hi}`} length={hi - lo + 1} valueAt={i => (step.stones.includes(lo + i) ? 'stone' : '·')} indexOffset={lo} active={step.stones.indexOf(hi) >= 0 ? hi - lo : -1} roleAt={i => (step.stones.includes(lo + i) ? 'stone' : '')} />
      <output aria-label="Move bounds">{`Minimum: ${step.minimum ?? '…'}, maximum: ${step.maximum ?? '…'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>An end stone moves to an empty spot strictly inside the current span, so the span shrinks on every move and the game always ends.</p>
    <p>The maximum is the span from the outer stones minus two: each move can shrink that span by exactly one, filling one empty spot per move. The minimum is zero, one or two depending on how the gaps look.</p>
  </>} />
}
