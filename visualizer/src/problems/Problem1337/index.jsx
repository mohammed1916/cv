import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  question: "Return the indices of the k rows with the fewest soldiers, in order of strength.",
  approaches: [
    { name: "Count and sort", intuition: "Count soldiers in each row, then sort rows by count and index.", time: "O(m log m + mn)", space: "O(m)" },
    { name: "Binary search per row", intuition: "Each row is sorted, so binary search finds its soldier count quickly.", time: "O(m log n + m log m)", space: "O(m)" },
  ],
  number: '1337', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with mat and k (JSON)',
  url: 'https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/',
  complexity: 'O(m log m + m n) time for counting and sorting the rows, and O(m) extra space.',
}

export default function WeakestRowsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const rows = s.strength.map(r => ({ row: r.row, soldiers: r.soldiers, rank: s.sorted ? s.sorted.indexOf(r.row) + 1 : '' }))
    const picked = s.picked ?? []
    return <>
      <RecordStateTable label={`Rows of the ${run.input.mat.length}-row matrix`} columns={['row', 'soldiers', 'rank']} rows={rows}
        activeRow={s.current ?? rows.findIndex(r => picked.includes(r.row))} />
      <p>Chosen so far: <strong>{picked.length ? picked.join(', ') : 'none'}</strong> (k = {s.k}).</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Rank by count, then index:</strong> rows are scored by their soldier count, and equal counts keep the smaller row index first.</p>
    <p>{step.message}</p>
  </>} />
}
