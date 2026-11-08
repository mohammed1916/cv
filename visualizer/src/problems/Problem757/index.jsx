import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort intervals by end, then by start descending.' },
    { id: 'compare', label: 'Inspect', description: 'Compare the interval start with the last two chosen points.' },
    { id: 'add2', label: 'Add two', description: 'No chosen point inside: add the two rightmost points.' },
    { id: 'add1', label: 'Add one', description: 'One chosen point inside: add the rightmost point.' },
    { id: 'skip', label: 'Skip', description: 'Both chosen points are inside already.' },
    { id: 'done', label: 'Complete', description: 'Return the number of chosen points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals (JSON)',
  url: 'https://leetcode.com/problems/set-intersection-size-at-least-two/',
  complexity: 'O(n log n) time for sorting plus one pass; capped at 40 intervals.',
  examples: [
    { label: 'Own case 1', input: '[[2,4],[4,8],[9,10]]' },
    { label: 'Own case 2', input: '[[2,4],[2,5],[3,6],[4,6]]' },
    { label: 'Own case 3', input: '[[2,3],[3,4],[3,5],[5,6]]' }, { label: 'Single interval', input: '[[0,1]]' }, { label: 'Equal endpoints', input: '[[1,3],[2,3],[3,5]]' }, { label: 'Full range', input: '[[0,100000000],[99999999,100000000]]' }, { label: 'Long run: 40 intervals', input: '[[349208,349311],[757995,762829],[346611,348635],[365856,368132],[194926,198761],[281861,285771],[379607,382802],[992452,992952],[11768,13309],[255498,257243],[851742,854899],[906882,909389],[745236,749043],[807962,812710],[17383,21445],[428860,433692],[771875,775034],[31573,34010],[298708,301146],[341521,345214],[102278,106477],[614555,614952],[473604,473889],[96928,101273],[724763,727128],[676364,676840],[402967,403658],[167307,167782],[322627,324286],[80392,81978],[567021,567149],[210352,212333],[354847,355534],[337967,340463],[249894,253458],[489137,490207],[619213,622448],[269473,274381],[144609,146176],[551661,552331]]' },
  ],
}

export default function SetIntersectionSizeTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {(() => {
      const { interval } = intervalView({ title: 'Intervals sorted by right end, with the points chosen so far', closed: true, note: step.message, marker: step.index >= 0 ? run.sorted[step.index][1] : null, markerLabel: 'current end',
        intervals: [...run.sorted.map(([start, end], i) => ({ start, end, group: 'Sorted intervals', role: i === step.index ? (step.phase === 'skip' ? 'kept' : 'current') : i < step.index ? 'done' : 'pending' })), ...step.chosen.map(p => ({ start: p, end: p, label: String(p), group: 'Chosen points', role: 'merged' }))] })
      return interval ? <IntervalView {...interval} /> : null
    })()}
    <IndexedSequence label="Intervals sorted by end" length={run.sorted.length} active={step.index} valueAt={i => `[${run.sorted[i][0]}, ${run.sorted[i][1]}]`} roleAt={i => i < step.index ? 'done' : ''} />
    <IndexedSequence label="Chosen points" length={step.chosen.length} valueAt={i => step.chosen[i]} active={step.chosen.length - 1} />
    <output aria-label="Last two points">Last two points: {step.a === null || step.a < 0 ? 'none' : step.a}, {step.b === null || step.b < 0 ? 'none' : step.b}</output>
  </>} renderReasoning={() => <>
    <p>Processing by right end means every later interval ends no earlier, so a chosen point as far right as possible is never worse. Only the two largest chosen points can lie inside a later interval, so just those are tracked.</p>
  </>} />
}
