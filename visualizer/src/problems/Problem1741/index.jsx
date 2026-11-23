import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, sql, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1741',
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of Employees rows: emp_id, event_day, in_time, out_time (minutes)',
  url: 'https://leetcode.com/problems/find-total-time-spent-by-each-employee/',
  question: "Find the total time each employee spent in the office on each day.",
  approaches: [
    { name: "Group and sum", intuition: "Group visits by employee and day and sum each out-minus-in duration.", time: "O(n)", space: "O(groups)" },
  ],
}

export default function Problem1741Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>An employee can enter and leave several times in a day. Each stay is out_time minus in_time.</p>
      <p>GROUP BY the employee and the day, then SUM the stays inside each group.</p>
    </>}
  />
}
