import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SelectionView from './SelectionView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples, url } from './algorithm'
import { meta } from './meta'

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples, url }

export default function SelectData() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <SelectionView run={run} step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Comparing a whole column with 101 produces a column of True and False. Indexing the table with that column removes rows, and indexing it with a list of names removes columns.</p>
      <p>The two steps are independent, so student_id can be used for the comparison and still be left out of the answer. If no id matches, the answer is an empty table, not an error.</p>
    </>} />
}
