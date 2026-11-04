import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AccessTimelineView from './AccessTimelineView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2933',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with access_times, a list of [name, HHMM] records',
  url: 'https://leetcode.com/problems/high-access-employees/',
  complexity: 'O(n log n) time to sort the times and O(n) space for the groups, for n records (up to 100).',
  examples: [
    { label: 'Under 60 vs exactly 60', input: '{"access_times":[["mia","0910"],["leo","1305"],["mia","0950"],["leo","1405"],["mia","0935"],["leo","1335"]]}' },
    { label: 'Midnight does not wrap', input: '{"access_times":[["zed","2340"],["zed","0010"],["zed","2355"]]}' },
    { label: 'Repeated time, lone visitor', input: '{"access_times":[["ana","0700"],["bob","1200"],["ana","0700"],["ana","0700"]]}' },
  ],
}

export default function HighAccessEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <AccessTimelineView run={run} step={step} />} renderReasoning={() => <>
    <p>Records arrive out of order and mix employees, so first split them per person and put each person's times in order.</p>
    <p>If any three accesses fit under an hour, then three neighbours in sorted order fit too: the times between the earliest and latest of the trio only pull them closer. So comparing each time with the one two places earlier is enough, and no other trio needs checking.</p>
    <p>The test is strictly under 60, which leaves out times exactly one hour apart. Using minutes since midnight also means 23:55 and 00:10 stay far apart, as the day does not wrap.</p>
  </>} />
}
