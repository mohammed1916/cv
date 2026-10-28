import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Encode', description: 'Write the matrix as one bit mask.' },
    { id: 'explore', label: 'Flip', description: 'Each flip XORs a toggle mask into the state.' },
    { id: 'done', label: 'Zero', description: 'Stop at the first all zero state.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix rows (JSON array of 1 to 3 arrays of 0 or 1)',
  url: 'https://leetcode.com/problems/minimum-number-of-flips-to-convert-binary-matrix-to-zero-matrix/',
  complexity: 'O(2^(m*n) * m*n) time and space in the worst case. The visualization caps the matrix at 3 by 3.',
  examples: [
    { label: 'Example 1', input: '[[0,0],[0,1]]' },
    { label: 'Already zero', input: '[[0]]' },
    { label: 'Example 3', input: '[[1,0,0],[1,0,1],[1,0,0]]' },
  ],
}

export default function BinaryFlips() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input[0].length
    return <>
      <table aria-label="Current matrix" className="flip-matrix"><tbody>
        {run.input.map((row, r) => <tr key={r}>{row.map((_, c) => {
          const value = (step.mask >> (r * n + c)) & 1
          return <td key={c} data-cell={`${r},${c}`} style={{ width: 36, height: 36, textAlign: 'center', border: '1px solid currentColor' }}>{value}</td>
        })}</tr>)}</tbody></table>
      <output aria-label="Flip state">{`Mask ${step.mask}, flips ${step.flips}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A state is the whole matrix as a bit mask, so each state is visited once by BFS.</p>
    <p>Flips commute, and flipping the same cell twice cancels, so the answer is the BFS depth to the zero mask.</p>
  </>} />
}
