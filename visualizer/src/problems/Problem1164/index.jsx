import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TableView from './TableView'
import { buildTrace, parseInput, code, sql, python, phases, inputLabel, complexity, examples } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel,
  complexity,
  question: "Report the price of each product on a given date when prices change over time, with a default price before any change.",
  approaches: [
    { name: "Latest change on or before the date", intuition: "For each product, take the most recent price change on or before the target date, or the default.", time: "O(P + C) with grouping", space: "O(P + C)" },
  ],
  examples,
}

export default function KnowledgeDerivedTableProblem() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <TableView run={run} step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample tables were invented for this visualization.</p>
    </>} />
}
