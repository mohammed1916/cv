import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import RecordStateTable from '../../components/shared/RecordStateTable'
import StateTransitionDiagram from '../../components/shared/StateTransitionDiagram'
import './Visual1524.css'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1524',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of positive integers',
  url: 'https://leetcode.com/problems/number-of-sub-arrays-with-odd-sum/',
  complexity: 'O(n) time and O(1) space: only the counts of even and odd prefix parities are kept.',
  examples: [
    { label: 'Small array', input: '[1,2,3]' },
    { label: 'Even start', input: '[4,5,6,7]' },
    { label: 'Mixed', input: '[2,2,1,8,3]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Repeated values', input: '[3,3,3,3]' },
    { label: 'Value limits', input: '[100,1,100,1]' },
    { label: 'Long run: 100 values', input: '[4,59,47,82,17,9,83,57,67,12,48,4,32,78,9,85,100,51,75,12,79,31,84,18,94,38,3,58,4,10,84,92,9,70,64,64,26,48,83,70,86,77,72,67,40,82,22,40,78,28,97,37,85,62,72,74,80,87,15,28,44,82,55,31,62,16,29,98,27,85,35,35,43,35,36,66,4,3,88,7,83,99,8,86,32,13,81,67,98,65,59,81,50,11,68,22,7,20,68,2]' },
  ],
}

export default function OddSumSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index = -1, parity = 0, odd = 0, even = 0, total = 0, added = 0 } = step.snapshot ?? {}
    const arr = run.input.arr
    // prefix[k] is the parity of the sum of the first k values; prefix[0] is the empty prefix (even).
    const prefix = [0]
    arr.forEach((value, k) => prefix.push(prefix[k] ^ (value & 1)))
    const current = index >= 0 ? index + 1 : 0
    // The transition taken by this step: from the parity before the value to the parity after it.
    const fromState = current > 0 ? (prefix[current - 1] ? 'odd' : 'even') : null
    const toState = current > 0 ? (prefix[current] ? 'odd' : 'even') : null
    // History: the start row and one row per value, up to the current step.
    const frames = run.frames
    const here = Math.max(0, frames.indexOf(step))
    const history = frames.slice(0, here + 1)
      .filter(frame => frame.phase === 'start' || frame.phase === 'record')
      .map(frame => ({
        value: frame.snapshot.value ?? 'start',
        parity: frame.snapshot.parity,
        even: frame.snapshot.even,
        odd: frame.snapshot.odd,
        added: frame.snapshot.added ?? 0,
        total: frame.snapshot.total,
      }))
    const valueRole = i => (arr[i] % 2 ? 'odd' : 'even')
    const prefixRole = k => {
      if (k > current) return 'future'
      // While counting, earlier prefixes with the opposite parity form the odd-sum subarrays.
      if (step.phase === 'count' && k < current && prefix[k] !== prefix[current]) return 'pair'
      return prefix[k] ? 'odd' : 'even'
    }
    return <>
      <section className="pr1524-block pr1524-block--values">
        <h4>Values and prefix parity</h4>
        <IndexedSequence label="Values (parity)" length={arr.length} valueAt={i => arr[i]} active={index} roleAt={valueRole} />
        <IndexedSequence label="Prefix parity (k values before)" length={prefix.length} valueAt={k => (prefix[k] ? 'odd' : 'even')} active={current} roleAt={prefixRole} />
      </section>
      <section className="pr1524-block pr1524-block--states">
        <h4>State changes</h4>
        <StateTransitionDiagram
          title="Prefix parity states"
          width={420}
          height={200}
          nodes={[
            { id: 'even', label: 'Even', sub: `${even} stored`, x: 100, y: 120, active: parity === 0 },
            { id: 'odd', label: 'Odd', sub: `${odd} stored`, x: 320, y: 120, active: parity === 1 },
          ]}
          edges={[
            { from: 'even', to: 'odd', label: `odd value +${even}`, bend: -18, active: fromState === 'even' && toState === 'odd' },
            { from: 'odd', to: 'even', label: `odd value +${odd}`, bend: -18, active: fromState === 'odd' && toState === 'even' },
            { from: 'even', to: 'even', label: `even value +${odd}`, active: fromState === 'even' && toState === 'even' },
            { from: 'odd', to: 'odd', label: `even value +${even}`, active: fromState === 'odd' && toState === 'odd' },
          ]}
        />
        <p>The added count is the number of stored prefixes with the opposite parity to the new state.</p>
      </section>
      <section className="pr1524-block pr1524-block--counts">
        <h4>Stored prefixes and totals</h4>
        <FrequencyCountTable title="Stored prefixes by parity" entries={[['even', even], ['odd', odd]]} active={parity ? 'odd' : 'even'} emptyText="Only the empty prefix is stored." />
        <p>Odd-sum subarrays added here: <strong>{added}</strong> · Total: <strong>{total}</strong></p>
      </section>
      <section className="pr1524-block pr1524-block--history">
        <h4>History</h4>
        <RecordStateTable
          label="One row per value"
          columns={['value', 'parity', 'even', 'odd', 'added', 'total']}
          rows={history}
          activeRow={history.length - 1}
        />
      </section>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix sums:</strong> a subarray has odd sum exactly when its two prefix sums have different parity.</p>
    <p><strong>Counting pairs:</strong> at each position, every earlier prefix with the opposite parity closes an odd-sum subarray.</p>
  </>} />
}
