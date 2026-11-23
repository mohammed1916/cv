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
  question: "Report, for each seller, whether the second item they sold was bought by a user who also bought their favourite brand.",
  approaches: [
    { name: "Per-seller ordering", intuition: "Rank each seller's orders by date and check the second one against the seller's recorded favourite brand.", time: "O(O log O)", space: "O(O)" },
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
