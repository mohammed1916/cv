import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BoardView from './BoardView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Place the source at distance zero.' },
    { id: 'pop', label: 'Expand', description: 'Take the next square from the queue.' },
    { id: 'visit', label: 'Reach', description: 'Slide along a diagonal to a new square.' },
    { id: 'done', label: 'Result', description: 'Report the target distance or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with source and target as [row, column] from 1 to 8',
  url: 'https://leetcode.com/problems/minimum-bishop-moves-to-reach-target/',
  complexity: 'O(64 * 4 * 8) time and O(64) space: a fixed-size breadth-first search over the board.',
  examples: [
    { label: 'Two moves', input: '{"source":[3,2],"target":[6,7]}' },
    { label: 'Different colours', input: '{"source":[1,1],"target":[2,3]}' },
    { label: "Adjacent squares", input: "{\"source\":[1,1],\"target\":[1,2]}" },
    { label: "Symmetric corners", input: "{\"source\":[1,1],\"target\":[8,8]}" },
    { label: "Opposite corners", input: "{\"source\":[1,8],\"target\":[8,1]}" },
    { label: "Long run: distant squares", input: "{\"source\":[2,7],\"target\":[7,2]}" },
  ],
}

export default function MinimumBishopMoves() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BoardView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
