import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BoardParityView from './BoardParityView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3996',
  phases: [
    { id: 'start', label: 'Start colour', description: 'Colour the knight square.' },
    { id: 'target', label: 'Target colour', description: 'Colour the target square.' },
    { id: 'compare', label: 'Compare', description: 'Check whether the colours agree.' },
    { id: 'done', label: 'Result', description: 'Report whether an even walk exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start and target as [row, column] (e.g. {"start":[0,0],"target":[1,1]})',
  url: 'https://leetcode.com/problems/even-number-of-knight-moves/',
  complexity: 'O(1) time and O(1) space: two parity computations.',
  examples: [
    { label: 'Different colours', input: '{"start":[0,0],"target":[2,1]}' },
    { label: 'Same colour', input: '{"start":[0,0],"target":[1,1]}' },
    { label: 'Zero moves', input: '{"start":[4,4],"target":[4,4]}' },
  ],
}

export default function EvenKnightMoves() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <BoardParityView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>A knight always lands on the opposite colour, and the board is connected, so the colour pattern alone decides the answer.</p>
    </>} />
}
