import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'
import SqlStages from './SqlStages'
import './SqlStages.css'

const definition = {
  question: "Count, for each day in a window, how many users logged in for the first time that day.",
  approaches: [
    { name: "Join and group in SQL", intuition: "Find each user's first login date and count the users per date.", time: "O(n + u log u)", space: "O(u)" },
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
