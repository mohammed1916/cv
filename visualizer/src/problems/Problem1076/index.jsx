import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'
import SqlStages from './SqlStages'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import './SqlStages.css'

const definition = {
  question: "Find the project with the most employees; ties include every project with that count.",
  approaches: [
    { name: "Join and group in SQL", intuition: "Count employees per project, then keep the projects matching the largest count.", time: "O(n)", space: "O(p)" },
  ],
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // Counting phases: show the per-project counts as a shared frequency table, with the project just counted highlighted.
    const counting = step.phase === 'count' || step.phase === 'max'
    const entries = counting ? step.rows.map(row => [row.project_id, row.employees]) : []
    const active = step.phase === 'count' && step.rows.length ? step.rows[step.rows.length - 1].project_id : null
    return <>
      {counting && <FrequencyCountTable title="Employees per project" entries={entries} active={active} />}
      <SqlStages phases={phases} step={step} resultCount={run.result.length} />
    </>
  }}
  renderReasoning={() => <p>Each stage shows the rows the query holds at that moment: the load, the grouping or join, the filter, then the output. Shaded rows are kept; struck rows are dropped.</p>} />
}
