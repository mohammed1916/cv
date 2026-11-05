import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1482', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Garden (JSON object with bloomDay, m and k)',
  url: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/',
  complexity: 'O(n log(max day - min day)) time and O(1) extra space. The visualization caps the garden at 60 flowers.',
}

export default function BouquetDaysVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const days = run.input.bloomDay
    const lo = s.lo ?? Math.min(...days), hi = s.hi ?? Math.max(...days)
    return <>
      <AnswerRangeBar title="Search range for the day" min={Math.min(...days)} max={Math.max(...days)} low={lo} high={hi}
        probe={s.mid ?? null} verdict={s.ok ?? null} />
      <IndexedSequence label="Bloom day of each flower" length={days.length} valueAt={i => days[i]} active={-1}
        roleAt={i => (s.mid !== null && s.mid !== undefined ? (days[i] <= s.mid ? 'bloomed by test day' : '') : '')} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>The test "can we make m bouquets by day d" only becomes easier as d grows, so the earliest working day is found by binary search over the day range.</p>
    <p>{step.message}</p>
  </>} />
}
