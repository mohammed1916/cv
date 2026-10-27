import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Day numbers', description: 'Convert each of the four dates to a day of the year.' },
    { id: 'arrival', label: 'Latest arrival', description: 'The later of the two arrivals starts the shared stay.' },
    { id: 'departure', label: 'Earliest departure', description: 'The earlier of the two departures ends the shared stay.' },
    { id: 'done', label: 'Complete', description: 'Count the days from the latest arrival to the earliest departure.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arriveAlice, leaveAlice, arriveBob, leaveBob as MM-DD',
  url: 'https://leetcode.com/problems/count-days-spent-together/',
  complexity: 'O(1) time and space, using the fixed month lengths of a non-leap year.',
  examples: [
    { label: 'Overlap', input: '{"arriveAlice":"08-15","leaveAlice":"08-18","arriveBob":"08-16","leaveBob":"08-19"}' },
    { label: 'No overlap', input: '{"arriveAlice":"10-01","leaveAlice":"10-31","arriveBob":"11-01","leaveBob":"12-31"}' },
  ],
}

export default function CountDaysTogether() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { aa, la, ab, lb } = step.days
    return <>
      <table aria-label="Stays as day numbers">
        <thead><tr><th>Person</th><th>Arrives</th><th>Leaves</th></tr></thead>
        <tbody>
          <tr><td>Alice</td><td>{aa}</td><td>{la}</td></tr>
          <tr><td>Bob</td><td>{ab}</td><td>{lb}</td></tr>
        </tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
      {step.phase === 'done' && <output aria-label="Result">{`Shared days: ${run.result}`}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Converting each date to its day of the year turns the question into comparing two intervals of integers.</p>
    <p>The shared days run from the later arrival to the earlier departure, so the count is that difference plus one, or zero when it is negative.</p>
  </>} />
}
