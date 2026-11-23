import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'
import SqlStages from './SqlStages'
import './SqlStages.css'

const definition = {
  question: "Report the average experience of employees on each project, rounded to two decimals.",
  approaches: [
    { name: "Join and group in SQL", intuition: "Join projects to employees, then average the experience for each project.", time: "O(n + m)", space: "O(n)" },
  ],
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) =>
    <SqlStages phases={phases} step={step} resultCount={run.result.length} />}
  renderReasoning={() => <p>Each stage shows the rows the query holds at that moment: the load, the grouping or join, the filter, then the output. Shaded rows are kept; struck rows are dropped.</p>} />
}
