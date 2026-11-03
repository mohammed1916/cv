import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Heights', description: 'Each column becomes a black height from 0 to n.' },
    { id: 'improve', label: 'Improve', description: 'This height choice beats the best seen so far.' },
    { id: 'done', label: 'Result', description: 'The best total over every choice.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (square array, at most 5 by 5)',
  url: 'https://leetcode.com/problems/maximum-score-from-grid-operations/description/',
  complexity: 'Brute force over (n + 1)^n height choices, each scored in O(n^2). The visualization caps n at 5.',
  examples: [
    { label: 'Small', input: '{"grid":[[0,0,0],[0,2,0],[3,0,0]]}' },
    { label: 'Two columns', input: '{"grid":[[4,6],[4,6]]}' },
  ],
}

export default function MaximumScoreFromGridOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="black height per column" length={run.input.grid.length}
      valueAt={i => (step.heights ? step.heights[i] : 0)} active={-1} />
    <output aria-label="Height choice score">{step.score == null
      ? 'Trying height choices.'
      : `heights ${step.heights.join(', ')}: score ${step.score}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>An operation blacks a column from the top down to one row, so a column's several operations collapse to its tallest one. Each column is therefore one number, its height.</p>
    <p>A white cell scores when a neighbouring column is taller than the cell's row. Trying every height combination on a small grid finds the best total.</p>
  </>} />
}
