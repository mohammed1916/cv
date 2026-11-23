import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import SalaryColumnView from './SalaryColumnView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  question: "Double every salary in a table while keeping the other columns and rows unchanged.",
  approaches: [
    { name: "Assign a doubled column", intuition: "Replace the salary column with twice its values in place.", time: "O(n)", space: "O(n)" },
    { name: "Row-by-row update", intuition: "Update each row's salary as it is visited.", time: "O(n)", space: "O(1) extra" },
  ],
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function ModifyColumns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SalaryColumnView run={run} step={step} />} renderReasoning={() => <>
    <p>A column assignment replaces one column and leaves every other column alone, so names and row positions cannot drift.</p>
    <p>Each new value depends only on the old value in the same row. Two employees sharing a name stay separate because rows are matched by position, not by name.</p>
  </>} />
}
