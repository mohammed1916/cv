import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'
import SqlStages from './SqlStages'
import './SqlStages.css'

const definition = {
  question: "For each product, report the year of its first sale and the quantity and price of that first sale.",
  approaches: [
    { name: "Join and group in SQL", intuition: "Find each product's earliest sale date, then keep the rows that match it.", time: "O(n log n)", space: "O(n)" },
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
