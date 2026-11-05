import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2018',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Board rows and word (JSON)',
  url: 'https://leetcode.com/problems/check-if-word-can-be-placed-in-crossword/',
  complexity: 'O(m * n * L) time: each run is compared with the word and its reverse.',
  examples: [
    { label: 'Vertical slot', input: '{"board":[" # ","   ","# #"],"word":"ab"}' },
    { label: 'Reversed across', input: '{"board":["ab#"],"word":"ba"}' },
    { label: 'Blocked slot', input: '{"board":["a#b"],"word":"ab"}' },
  ],
}

export default function CheckWordInCrossword() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { board, run, ok } = step.snapshot
    const inRun = (r, c) => run !== null && run.some(([y, x]) => y === r && x === c)
    return <>
      <table aria-label="Crossword board" style={{ borderCollapse: 'collapse' }}>
        <tbody>{board.map((row, r) => <tr key={r}>{[...row].map((ch, c) => <td key={c} style={{
          width: 30, height: 30, textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
          border: '1px solid var(--border)',
          background: inRun(r, c) ? (ok ? 'var(--primary-glow)' : 'var(--surface2)') : 'transparent',
        }}>{ch === '#' ? '■' : ch === ' ' ? '' : ch}</td>)}</tr>)}</tbody>
      </table>
      <p>{run ? `Testing a run of ${run.length} open cells: ${ok ? 'it matches.' : 'it does not match.'}` : 'Open runs are the stretches between # cells.'}</p>
    </>
  }} renderReasoning={() => <p>A word fits only in a complete open run of its exact length, because the # cells and the board edges fix both ends. The word may be read forwards or backwards.</p>} />
}
