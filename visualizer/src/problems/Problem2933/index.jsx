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
    { label: 'One record', input: '{"access_times":[["amy","0800"]]}' },
    { label: 'Three within an hour', input: '{"access_times":[["kim","1200"],["kim","1230"],["kim","1259"]]}' },
    { label: 'Earliest and latest times', input: '{"access_times":[["max","0000"],["max","0059"],["max","2359"]]}' },
    { label: 'Long run: 60 records', input: '{"access_times":[["bo","0346"],["fay","0352"],["bo","0738"],["ava","0406"],["dan","1800"],["dan","1646"],["eli","0710"],["cy","1227"],["dan","1540"],["cy","2014"],["cy","1916"],["dan","0309"],["fay","0055"],["dan","1826"],["dan","0707"],["bo","1141"],["ava","2106"],["dan","0723"],["fay","1050"],["bo","0307"],["cy","0414"],["cy","1629"],["cy","1209"],["dan","1208"],["fay","0248"],["bo","2305"],["eli","2212"],["cy","0543"],["eli","0548"],["dan","1700"],["cy","0617"],["eli","2257"],["fay","1836"],["fay","1750"],["fay","0013"],["bo","1637"],["eli","0856"],["ava","2038"],["eli","0803"],["dan","1333"],["eli","1517"],["bo","2113"],["bo","1908"],["cy","0743"],["eli","0617"],["eli","0604"],["dan","0033"],["cy","0345"],["bo","1354"],["bo","0653"],["dan","1049"],["fay","0322"],["cy","1752"],["dan","1100"],["bo","1912"],["bo","1944"],["eli","0908"],["fay","0110"],["fay","0247"],["fay","0948"]]}' },
  ],
}

export default function HighAccessEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <AccessTimelineView run={run} step={step} />} renderReasoning={() => <>
    <p>Records arrive out of order and mix employees, so first split them per person and put each person's times in order.</p>
    <p>If any three accesses fit under an hour, then three neighbours in sorted order fit too: the times between the earliest and latest of the trio only pull them closer. So comparing each time with the one two places earlier is enough, and no other trio needs checking.</p>
    <p>The test is strictly under 60, which leaves out times exactly one hour apart. Using minutes since midnight also means 23:55 and 00:10 stay far apart, as the day does not wrap.</p>
  </>} />
}
