import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Projects":[{"project_id":1,"skill":"sql"},{"project_id":2,"skill":"python"},{"project_id":3,"skill":"rust"}],"Candidates":[{"candidate_id":10,"skill":"sql","proficiency":4},{"candidate_id":4,"skill":"sql","proficiency":5},{"candidate_id":9,"skill":"sql","proficiency":5},{"candidate_id":7,"skill":"python","proficiency":3},{"candidate_id":2,"skill":"python","proficiency":3}]}'
const noMatch = '{"Projects":[{"project_id":5,"skill":"go"}],"Candidates":[{"candidate_id":1,"skill":"sql","proficiency":2}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Projects (project_id, skill) and Candidates (candidate_id, skill, proficiency 1 to 5)',
  url: 'https://leetcode.com/problems/find-candidates-for-data-scientist-position-ii/description/',
  complexity: 'O(p * c log c) for p projects and c candidates. The visualization caps the tables at 8 and 10 rows.',
  examples: [
    { label: 'Three projects', input: sample },
    { label: 'No match', input: noMatch },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindCandidatesForDataScientistPositionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Picks so far" columns={['project_id', 'candidate_id', 'proficiency']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} project row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>Each project is matched only with candidates who have the same skill. Sorting by proficiency descending and then by candidate id makes the first row the pick.</p>
    <p>A project with no matching candidate produces no row, which is the same effect as an inner join.</p>
  </>} />
}
