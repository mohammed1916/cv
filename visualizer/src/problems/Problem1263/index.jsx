import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Place the player and box at cost zero.' },
    { id: 'explore', label: 'Expand', description: 'Walk for free or push the box for one.' },
    { id: 'done', label: 'Return', description: 'Return the pushes when the box reaches the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Board rows (JSON array of strings with #, ., S, B, T)',
  url: 'https://leetcode.com/problems/minimum-moves-to-move-a-box-to-their-target-location/',
  complexity: 'O(R * C * R * C) states with O(1) work each. The visualization caps the board at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '["#######","#T....#","#.B...#","#...S.#","#######"]' },
    { label: 'One push', input: '["#####","#TB.#","#S..#","#####"]' },
    { label: 'Boxed in', input: '["#####","#T#B#","#S###","#####"]' },
  ],
}

export default function BoxTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Board" className="box-board"><tbody>
      {run.input.map((row, r) => <tr key={r}>{[...row].map((ch, c) => {
        const isBox = step.box[0] === r && step.box[1] === c
        const isPlayer = step.player[0] === r && step.player[1] === c
        const text = isBox ? 'B' : isPlayer ? 'P' : ch === 'S' || ch === 'B' ? '.' : ch
        return <td key={c} data-cell={`${r},${c}`} style={{ width: 28, height: 28, textAlign: 'center', border: '1px solid currentColor' }}>{text}</td>
      })}</tr>)}</tbody></table>
    <output aria-label="Push state">{`Box at (${step.box}), player at (${step.player}), pushes so far ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>Walking is free, so a walk is a 0-cost edge. A push moves the box one cell and costs one, so it is a 1-cost edge.</p>
    <p>Using a deque keeps the states in order of pushes, so the first time the box is on the target is the minimum.</p>
    <p>The player must stand on the far side of the box to push it, which is why the search tracks both positions.</p>
  </>} />
}
