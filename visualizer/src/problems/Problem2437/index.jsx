import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const pad = v => String(v).padStart(2, '0')

const definition = {
  phases: [
    { id: 'start', label: 'Pattern', description: 'Split the pattern into hours and minutes.' },
    { id: 'hours', label: 'Hours', description: 'Find the hours from 00 to 23 that fit the hour pattern.' },
    { id: 'minutes', label: 'Minutes', description: 'Find the minutes from 00 to 59 that fit the minute pattern.' },
    { id: 'done', label: 'Complete', description: 'Multiply the two counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with time as hh:mm, using digits or ? in each place, for example {"time":"?5:00"}',
  url: 'https://leetcode.com/problems/number-of-valid-clock-times/',
  complexity: 'O(1) time, since the search covers 24 hours and 60 minutes.',
  examples: [
    { label: 'Example 1', input: '{"time":"?5:00"}' },
    { label: 'Example 2', input: '{"time":"0?:0?"}' },
  ],
}

export default function ValidClockTimes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Hours 00 to 23" length={24} valueAt={index => pad(index)} roleAt={index => (step.hours.includes(index) ? 'fits' : '')} active={-1} />
    <output aria-label="Counts">{`Hours: ${step.hours.length}. Minutes: ${step.minutes.length}.`}</output>
  </>} renderReasoning={() => <>
    <p>Each ? can take any value that fits its place, and the hour and minute parts are chosen independently.</p>
    <p>The number of valid times is the number of hours that fit times the number of minutes that fit.</p>
  </>} />
}
