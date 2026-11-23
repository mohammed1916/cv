import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TableView from './TableView'
import { buildTrace, parseInput, code, sql, python, phases, inputLabel, complexity, examples } from './algorithm'
import { meta } from './meta'

const definition = {
  question: "Find active businesses that have more events of a type than that type's average.",
  approaches: [
    { name: "Join and group in SQL", intuition: "Compute each event type's average, then count each business's qualifying events.", time: "O(n)", space: "O(n)" },
  ],
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel,
  complexity,
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
