import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BurstyCalendarView from './BurstyCalendarView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function FindBurstyBehavior() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BurstyCalendarView run={run} step={step} />} renderReasoning={() => <>
    <p>The rule simplifies. The average is the post count over 4, and twice that is half the post count. So a user is bursty exactly when some 7-day stretch holds at least half of their February posts.</p>
    <p>A window only needs to start on a day the user posted. Any other window can be slid forward to its first post without losing a post, so the busiest window always has a post on its first day.</p>
    <p>Dates outside 1 to 28 February are dropped first, including 29 February, which this count of four weeks leaves out. A window that starts late in the month, drawn with a dashed right edge, runs past the end but can only ever count posts up to 28 February.</p>
    <p>In SQL the same count is a window function over a date range. The two figures are computed row by row, so the query keeps the largest of each for the user.</p>
  </>} />
}
