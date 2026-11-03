import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/longest-arithmetic-subsequence-of-given-difference/',
}

const box = { display: 'inline-block', minWidth: 46, padding: '4px 8px', marginRight: 6, marginBottom: 6, border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'monospace', textAlign: 'center' }

export default function LongestArithmeticSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { best, x, predecessor, index, recorded } = step.snapshot
    return <>
      <div aria-label="Input array" style={{ marginBottom: 12 }}>
        {run.input.arr.map((value, i) => <span key={i} style={{
          ...box,
          background: i === index ? '#facc15' : i < (index ?? -1) ? 'var(--surface2)' : 'transparent',
          color: i === index ? '#1c1917' : 'var(--text)',
        }}>{value}</span>)}
      </div>
      <p>Best chain ending at each value (a chain is a subsequence with a fixed difference of {run.input.difference}):</p>
      <div aria-label="Best chain lengths">
        {best.length === 0 ? <span style={{ color: 'var(--text-dim)' }}>none yet</span>
          : best.map(entry => <span key={entry.value} style={{ ...box, borderColor: entry.value === x ? '#0891b2' : 'var(--border)' }}>
            {entry.value}: {entry.length}{recorded !== undefined && entry.value === x ? ' (new)' : ''}
          </span>)}
      </div>
      {predecessor !== undefined && x !== null && <p aria-label="Predecessor">Looking for {predecessor} = {x} − {run.input.difference}</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why one lookup:</strong> in a chain with a fixed difference, the element before x must be exactly x minus the difference. A map from value to best length turns each step into a single lookup.</p>
    <p>With difference 0 the predecessor is the same value, so repeated values extend the chain. The lookup happens before the write, so an element never extends itself.</p>
  </>} />
}
