import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty counts', description: 'No first digits recorded yet.' },
    { id: 'pair', label: 'Count pairs', description: 'Add the earlier first digits that pair with this last digit.' },
    { id: 'record', label: 'Record digit', description: 'Record this number’s first digit for later numbers.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/number-of-beautiful-pairs/',
  complexity: 'O(n * 9) time with ten digit counters. The visualization caps input at 10 values.',
  examples: [
    { label: 'Five values', input: '{"nums":[2,5,1,4]}' },
    { label: 'Two-digit', input: '{"nums":[11,21,12]}' },
    { label: 'Two values', input: '{"nums":[9,1]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7]}' },
    { label: 'Largest values', input: '{"nums":[9999,1,9999,1,9999,1,9999,1,9999,1]}' },
    { label: 'Long run: 10 values', input: '{"nums":[5931,3002,8857,8094,9990,8373,9479,5968,3926,9468]}' },
  ],
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export default function NumberOfBeautifulPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.index ?? -1
    const last = current >= 0 ? run.input.nums[current] % 10 : null
    return <>
      <IndexedSequence label="Numbers in order" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={current}
        roleAt={i => (i < current ? 'earlier' : i === current ? 'current' : 'later')} />
      <section aria-label="First digit counts" style={{ display: 'grid', gap: 6, marginTop: 12 }}>
        <h3 style={{ margin: 0, color: 'var(--text)' }}>Earlier first digits (count)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map(d => {
            const pairs = last !== null && gcd(d, last) === 1
            return <div key={d} style={{ textAlign: 'center', padding: 6, borderRadius: 6, border: '1px solid var(--border)', background: pairs ? 'var(--primary-glow)' : 'var(--surface)', color: 'var(--text)' }}>
              <div>{d}</div><strong>{step.seen[d]}</strong>
            </div>
          })}
        </div>
        <p style={{ margin: 0, color: 'var(--text)' }}>{last === null ? 'No current last digit yet.' : `Last digit ${last}: highlighted first digits are coprime with it, so their counts are added.`}</p>
      </section>
      <output aria-label="Pairs" style={{ display: 'block', marginTop: 8, color: 'var(--text)' }}>{`${step.message} Total ${step.total}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the first digit of earlier numbers and the last digit of the current number matter, so ten counters are enough.</p>
    <p>Each new number is checked against the nine possible first digits, and the counts of the coprime ones are added at once.</p>
  </>} />
}
