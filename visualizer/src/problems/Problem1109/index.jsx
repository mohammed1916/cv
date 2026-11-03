import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel, url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function CorporateFlightBookingsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Difference slots" length={run.input.n + 2}
      valueAt={index => step.snapshot.diff[index]}
      roleAt={index => step.snapshot.focus.includes(index) ? 'changed' : ''}
      active={step.snapshot.focus[0] ?? -1} />
    <IndexedSequence label="Reserved seats per flight" length={run.input.n}
      valueAt={index => index < step.snapshot.totals.length ? step.snapshot.totals[index] : '·'}
      active={step.snapshot.flight - 1} />
  </>} renderReasoning={({ step }) => <>
    <p>A booking that covers flights first through last changes the count only at its two ends. Writing the seats at slot first and their removal at slot last plus one lets one sweep rebuild every flight.</p>
    <p>{step.message}</p>
  </>} />
}
