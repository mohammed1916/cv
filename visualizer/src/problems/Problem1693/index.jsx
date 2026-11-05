import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, sql, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1693',
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of DailySales rows: date_id, make_name, lead_id, partner_id',
  url: 'https://leetcode.com/problems/daily-leads-and-partners/',
}

export default function Problem1693Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>GROUP BY splits the rows into one bucket per (date, product). Each bucket is then reduced on its own.</p>
      <p>COUNT(DISTINCT x) is the size of the set of x values in the bucket, so repeats within a bucket do not add.</p>
    </>}
  />
}
