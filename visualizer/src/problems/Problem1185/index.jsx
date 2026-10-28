import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting days from 1 January 1971.' },
    { id: 'years', label: 'Years', description: 'Add 365 or 366 days for each whole year.' },
    { id: 'done', label: 'Complete', description: 'Index the weekday name from the day count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with day, month and year, for example {"day":31,"month":8,"year":2019}',
  url: 'https://leetcode.com/problems/day-of-the-week/',
  complexity: 'O(years + 12) time for the visualization. The closed form runs in O(1).',
  examples: [
    { label: 'Example 1', input: '{"day":31,"month":8,"year":2019}' },
    { label: 'Example 2', input: '{"day":18,"month":7,"year":1999}' },
  ],
}

export default function DayOfWeek() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Weekday names" length={7} valueAt={index => NAMES[index]} active={step.index ?? -1} />
    <output aria-label="Days counted">{`Days since 1 January 1971: ${step.days}`}</output>
  </>} renderReasoning={() => <>
    <p>1 January 1971 was a Friday. Count the days from that date to the target, then move forward that many days in the week.</p>
    <p>Leap years add an extra day in February, which affects the day count after that point.</p>
  </>} />
}
