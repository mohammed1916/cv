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
  question: "Count the clock times in 24-hour hh:mm format that match a pattern where some digits are unknown question marks.",
  approaches: [
    { name: "Count hours and minutes separately", intuition: "The hour and minute parts are independent, so count the valid hours and valid minutes and multiply.", time: "O(1)", space: "O(1)" },
    { name: "Brute force every time", intuition: "Test all 1440 times of the day against the pattern.", time: "O(1)", space: "O(1)" },
  ],
  examples: [
    { label: 'Own: 1?:4?', input: '{"time":"1?:4?"}' },
    { label: 'Own: ??:3?', input: '{"time":"??:3?"}' },
    { label: 'All unknown', input: '{"time":"??:??"}' },
    { label: 'Equal digits', input: '{"time":"11:11"}' },
    { label: 'Largest time', input: '{"time":"23:59"}' },
    { label: 'Mixed unknowns', input: '{"time":"?9:5?"}' },
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
