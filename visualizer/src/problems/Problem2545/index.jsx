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
    { label: 'Four students, first exam', input: '{"score":[[9,4,12],[3,15,6],[7,8,1],[11,2,10]],"k":0}' },
    { label: 'Last exam of three students', input: '{"score":[[30,2],[21,50],[7,44]],"k":1}' },
    { label: 'One student, one exam', input: '{"score":[[50]],"k":0}' },
    { label: 'Equal totals', input: '{"score":[[10,20],[20,10]],"k":1}' },
    { label: 'Eight students, five exams', input: '{"score":[[0,7,14,21,28],[13,20,27,34,41],[26,33,40,47,54],[39,46,53,60,67],[52,59,66,73,80],[65,72,79,86,93],[78,85,92,99,5],[91,98,4,11,18]],"k":4}' },
    { label: 'Long run: eight students, five exams', input: '{"score":[[22,20,45,8,17],[60,71,48,79,71],[95,70,20,55,70],[87,15,61,90,92],[67,17,63,67,99],[76,81,15,57,27],[55,11,84,23,45],[34,23,26,25,49]],"k":2}' },
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
