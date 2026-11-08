import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No targets are covered yet, at zero cost.' },
    { id: 'element', label: 'Number', description: 'Let this number cover a subset of targets at its cheapest cost.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest cost that covers every target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target arrays (JSON)',
  url: 'https://leetcode.com/problems/minimum-increments-for-target-multiples-in-an-array/',
  complexity: 'O(n * 3^t) time for n numbers and t targets. The visualization caps nums at 5 and target at 4.',
  examples: [
    { label: 'Three numbers, two targets', input: '{"nums":[3,7,2],"target":[9,4]}' },
    { label: 'Two targets', input: '{"nums":[8,4],"target":[6]}' },
    { label: 'Smallest case', input: '{"nums":[1],"target":[1]}' },
    { label: 'Equal values tie', input: '{"nums":[4,4],"target":[4]}' },
    { label: 'Extremes', input: '{"nums":[20,20,20,20,20],"target":[20,20,20,20]}' },
    { label: 'Long run: 5 and 4 values', input: '{"nums":[16,14,3,3,15],"target":[6,4,9,10]}' },
  ],
}

const show = v => (Number.isFinite(v) ? v : '-')

export default function TargetMultiples() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cheapest cost for each set of covered targets (bit j = target j)" length={step.dp.length}
      valueAt={i => show(step.dp[i])} active={-1} roleAt={i => (i ? '' : 'nothing covered')} />
    <output aria-label="Best cost">{`Cheapest cost to cover all targets so far: ${show(step.total)}`}</output>
  </>} renderReasoning={() => <>
    <p>A number raised to a multiple of the lcm of some targets covers all of them at once, so each number takes one subset of targets.</p>
    <p>The bitmask records which targets are covered, and each number can extend any covered set by the subset it takes.</p>
  </>} />
}
