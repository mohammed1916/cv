import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NextDayView from './NextDayView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, javascript, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function NextDay() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <NextDayView run={run} step={step} />} renderReasoning={() => <>
    <p>Adding a day is one small step with a carry. Most days only the day field changes. On the last day of a month the day wraps to 1 and the month goes up, and on 31 December the month wraps too and the year goes up.</p>
    <p>The only thing that varies is where a month ends, and only February depends on the year. A year is a leap year when it divides by 4, unless it is a century year that does not also divide by 400. So 2028 and 2000 are leap years, and 2100 is not.</p>
    <p>The task itself is written in JavaScript, where the Date object already does this carrying. The method adds one to a copy, so the date it was called on stays the same. It uses the UTC day because a date written as YYYY-MM-DD means midnight UTC, and toISOString also reads UTC, so the local time zone cannot shift the answer:</p>
    <pre style={{ overflowX: 'auto', background: 'var(--surface2)', color: 'var(--text)', padding: 8, borderRadius: 6 }}><code>{javascript}</code></pre>
    <p>The steps on this page and the Python tab spell out the carrying that Date does for you.</p>
  </>} />
}
