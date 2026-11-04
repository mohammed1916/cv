import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HourLanesView from './HourLanesView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function FindPeakCallingHours() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <HourLanesView step={step} />} renderReasoning={() => <>
    <p>Only the hour of day matters, so calls from different dates land in the same group. Grouping by both city and hour gives one bar per hour in each city.</p>
    <p>RANK is the right window function because tied counts share rank 1. ROW_NUMBER would keep one tied hour and silently lose the others.</p>
    <p>The partition is per city, so a quiet city still reports its own peak even when another city is far busier.</p>
  </>} />
}
