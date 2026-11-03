import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, textAlign: 'center', border: '1px solid var(--border)', padding: 4, fontFamily: 'monospace' }

const definition = {
  number: '1551',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Length n (one integer)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-equal/',
  complexity: 'O(n) time for the loop over the lower half, and O(n) space for the array view.',
  examples: [
    { label: 'Three', input: '3' },
    { label: 'Six', input: '6' },
    { label: 'Ten', input: '10' },
  ],
}

export default function MinimumOperationsEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, target, index, need, ops } = step.snapshot
    return <>
      <div aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((v, i) => <div key={i} style={{ ...cell, background: i === index ? 'var(--surface2)' : 'transparent', borderWidth: i === index ? 2 : 1 }}>{v}</div>)}
      </div>
      <p>Every value must reach <strong>{target}</strong>. Running operations: <strong>{ops}</strong>{need !== undefined && <> · this step's deficit: <strong>{need}</strong></>}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the values are the first n odd numbers, so their average is n. Each operation moves one unit, so the lower half's total deficit to n is the answer.</p>
    <p>The upper half needs the same amount lowered, so counting one half is enough.</p>
  </>} />
}
