import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bitmasks', description: 'Encode every row and column as a bitmask.' },
    { id: 'classify', label: 'Classify', description: 'Each mask must equal the first mask or its complement.' },
    { id: 'balance', label: 'Balance', description: 'Ones and zeros, and the two kinds of mask, must be nearly equal in number.' },
    { id: 'moves', label: 'Count swaps', description: 'Compare to the alternating target and count swaps.' },
    { id: 'done', label: 'Complete', description: 'Add row and column swaps, or return -1.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Grid board (JSON, n x n, n up to 20)',
  url: 'https://leetcode.com/problems/transform-to-chessboard/',
  complexity: 'O(n^2) time to build masks and O(n) extra space.',
  examples: [
    { label: '4x4 -> 2', input: '[[0,1,1,0],[0,1,1,0],[1,0,0,1],[1,0,0,1]]' },
    { label: '2x2 -> 0', input: '[[0,1],[1,0]]' },
    { label: '2x2 -> -1', input: '[[1,0],[1,0]]' },
    { label: '3x3 -> 2', input: '[[0,1,1],[1,0,0],[1,0,0]]' },
  ],
}
export default function TransformToChessboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {run.input.map((row, i) => <IndexedSequence key={i} label={`Board row ${i}`} length={row.length} active={step.axis === 'row' ? step.index === i ? 0 : -1 : -1}
      valueAt={j => row[j]} roleAt={() => (step.axis === 'row' && step.kinds[i] ? `kind-${step.kinds[i]}` : '')} />)}
    {step.rows && <output aria-label="Row masks">Row masks: {step.rows.join('  ')}</output>}
    {step.cols && <output aria-label="Column masks">Column masks: {step.cols.join('  ')}</output>}
    <output aria-label="Result so far">{step.axis ? `Analysing ${step.axis}s` : ''}{step.moves !== undefined ? ` | swaps: ${step.moves}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why it factors:</strong> a chessboard has exactly two distinct rows, complements of each other and each alternating. A row swap only permutes rows, and a column swap only permutes columns, so each axis is solved independently and the answers add.</p>
  </>} />
}
