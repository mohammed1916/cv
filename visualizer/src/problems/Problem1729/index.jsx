import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, sql, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1729',
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of Followers rows: user_id (the user followed) and follower_id',
  url: 'https://leetcode.com/problems/find-followers-count/',
}

export default function Problem1729Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Each follow row is one follower for one user, so counting rows per user gives the followers count.</p>
      <p>GROUP BY collects the rows of one user; ORDER BY sorts the output by user_id.</p>
    </>}
  />
}
