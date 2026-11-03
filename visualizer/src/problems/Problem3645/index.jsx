import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is activated yet.' },
    { id: 'activate', label: 'Activate', description: 'Activate one element and apply the kills.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with value and limit (same length, up to 8 elements)',
  url: 'https://leetcode.com/problems/maximum-total-from-optimal-activation-order/description/',
  complexity: 'Teaching search over activation states: at most 2^n activated sets times the possible maximum counts, memoized.',
  examples: [
    { label: 'Invented example', input: '{"value":[4,6,2],"limit":[1,3,2]}' },
    { label: 'Single element', input: '{"value":[7],"limit":[1]}' },
  ],
}

export default function MaximumTotalFromOptimalActivationOrder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="value" length={run.input.value.length} valueAt={i => `${run.input.value[i]} / limit ${run.input.limit[i]}`}
      active={step.index >= 0 ? step.index : -1}
      roleAt={i => step.dead.includes(i) ? 'inactive' : step.activeSet.includes(i) ? 'active' : ''} />
    <output aria-label="Running total">{`total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Once the active count reaches an element's limit, that element can never be activated, so only the largest count seen so far matters for the future.</p>
    <p>Memoizing on (activated set, largest count) reuses every equivalent state across the search.</p>
    <p>This teaching model is knowledge-derived and not verified against the official judge.</p>
  </>} />
}
