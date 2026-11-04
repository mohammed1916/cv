import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import PassBoardView from './PassBoardView'
import { buildTrace, parseInput, code, sql, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function TeamDominanceByPassSuccess() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PassBoardView run={run} step={step} />} renderReasoning={() => <>
    <p>The Teams table must be joined twice: once to name the sender's team and once to name the receiver's. Comparing those two names is the whole score rule.</p>
    <p>The points belong to the sender's team, so an interception lowers the passer's score and does nothing for the side that took the ball.</p>
    <p>Grouping only creates a row for a pair that has at least one pass, so a side that never passes in a half is absent from the report instead of showing 0.</p>
  </>} />
}
