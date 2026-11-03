import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1566',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr, m and k (JSON)',
  url: 'https://leetcode.com/problems/detect-pattern-of-length-m-repeated-k-or-more-times/',
  complexity: 'O(n) time and O(1) extra space: one pass that counts consecutive positions where a value equals the one m places later.',
  examples: [
    { label: 'Pattern of two, twice', input: '{"arr":[5,1,3,1,3,9,1,3,2],"m":2,"k":2}' },
    { label: 'Not three times', input: '{"arr":[5,1,3,1,3,9,1,3,2],"m":2,"k":3}' },
    { label: 'Single value', input: '{"arr":[7,7,7,7],"m":1,"k":4}' },
  ],
}

export default function RepeatedPattern() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, m, need, index, run: matches, found } = step.snapshot
    return <>
      <div role="img" aria-label="Array with the current comparison" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => {
          const compared = index >= 0 && (i === index || i === index + m)
          const inMatch = index >= 0 && matches > 0 && i <= index + m && i >= index + m - (matches + m - 1)
          return <div key={i} data-position={i} style={{
            minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${compared ? 2 : 1}px solid ${compared ? '#0891b2' : 'var(--border)'}`,
            background: found && inMatch ? '#bbf7d0' : compared ? 'var(--surface2)' : 'transparent', color: '#1c1917',
          }}><div>{value}</div><small>{i}</small></div>
        })}
      </div>
      <p>Matches in a row: <strong>{matches}</strong> of {need} needed (gap m = {m}).</p>
      <p>{found ? 'The repeated block has been found.' : 'The block has not been found yet.'}</p>
      <p>Pattern length {run.input.m}, repeated {run.input.k} times or more.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> a block of k copies of a length-m pattern is the same as a stretch of (k-1) times m consecutive positions where each value equals the one m places later.</p>
    <p><strong>One pass:</strong> keep the length of the current stretch of matches; the first time it reaches (k-1) times m, the answer is yes.</p>
  </>} />
}
