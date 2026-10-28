import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every student row is still in the working list.' },
    { id: 'find', label: 'Find best', description: 'Scan the remaining rows for the highest score in the sort column.' },
    { id: 'take', label: 'Place', description: 'Move the chosen row to the end of the result.' },
    { id: 'done', label: 'Complete', description: 'The result lists students from highest to lowest kth score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with score (rows of exam scores) and k (column index)',
  url: 'https://leetcode.com/problems/sort-the-students-by-their-kth-score/',
  complexity: 'O(m^2) time for this selection walk over m students, O(m * n) space. The visualization caps input at 8 by 5.',
  examples: [
    { label: 'Example 1', input: '{"score":[[10,6,9,1],[7,5,11,2],[4,8,3,15]],"k":2}' },
    { label: 'Example 2', input: '{"score":[[3,4],[5,6]],"k":0}' },
  ],
}

export default function SortStudentsByKthScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table className="kth-score-table" aria-label="Scores in input order">
      <thead><tr><th>Student</th>{run.input.score[0].map((_, j) => <th key={j}>{j === run.input.k ? `Exam ${j} (sort)` : `Exam ${j}`}</th>)}</tr></thead>
      <tbody>{run.input.score.map((row, i) => <tr key={i} data-role={step.picked === i ? 'active' : step.taken.includes(i) ? 'taken' : ''}>
        <td>Student {i}</td>{row.map((v, j) => <td key={j}>{v}</td>)}
      </tr>)}</tbody>
    </table>
    <output aria-label="Result so far">{`Placed so far: ${step.result.map(r => `[${r.join(', ')}]`).join(' ') || '(none yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the chosen column decides the order, so each step picks the best remaining row for that column.</p>
    <p>Rows are moved whole, so every student keeps all of their exam scores.</p>
  </>} />
}
