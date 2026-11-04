import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import SkillFitView from './SkillFitView'

const sample = '{"Projects":[{"project_id":61,"skill":"alpha","importance":4},{"project_id":61,"skill":"beta","importance":3},{"project_id":61,"skill":"gamma","importance":5},{"project_id":62,"skill":"alpha","importance":2},{"project_id":63,"skill":"delta","importance":1}],"Candidates":[{"candidate_id":8,"skill":"alpha","proficiency":5},{"candidate_id":8,"skill":"beta","proficiency":3},{"candidate_id":8,"skill":"gamma","proficiency":4},{"candidate_id":3,"skill":"alpha","proficiency":5},{"candidate_id":3,"skill":"beta","proficiency":3},{"candidate_id":3,"skill":"gamma","proficiency":4},{"candidate_id":5,"skill":"alpha","proficiency":2},{"candidate_id":5,"skill":"beta","proficiency":1}]}'
const noMatch = '{"Projects":[{"project_id":5,"skill":"go","importance":3}],"Candidates":[{"candidate_id":1,"skill":"sql","proficiency":2}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Projects (project_id, skill, importance) and Candidates (candidate_id, skill, proficiency), values 1 to 5',
  url: 'https://leetcode.com/problems/find-candidates-for-data-scientist-position-ii/description/',
  complexity: 'O(p * c * s) for p project rows, c candidate ids and s skills per project. The visualization caps the tables at 8 projects and 10 candidate rows.',
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
    <SkillFitView step={step} />
    <RowsTable caption="Picks so far" columns={['project_id', 'candidate_id', 'score']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} project row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A candidate must have every skill of the project. Each matched skill adds 10 when proficiency is above importance and subtracts 5 when it is below.</p>
  </>} />
}
