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
    { label: 'Single value', input: '{"arr":[7],"m":1,"k":1}' },
    { label: 'Equal values', input: '{"arr":[4,4,4,4],"m":2,"k":2}' },
    { label: 'Pattern absent', input: '{"arr":[1,2,3],"m":5,"k":1}' },
    { label: 'Long run: 100 values', input: '{"arr":[87,54,50,31,2,20,45,50,90,39,7,44,86,86,37,28,71,79,80,60,98,62,5,9,26,14,2,60,11,83,57,30,42,23,84,31,4,63,14,69,55,21,17,82,96,69,23,89,77,27,66,56,16,53,26,34,96,84,6,72,64,43,60,67,38,14,22,64,50,71,34,8,39,38,21,17,59,7,61,88,48,40,84,20,51,26,32,39,9,80,58,89,45,34,14,66,15,19,11,33],"m":3,"k":4}' },
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
            background: found && inMatch ? '#bbf7d0' : compared ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
          }}><div>{value}</div><small>{i}</small>
            <small style={{ display: 'block', height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
              {index >= 0 && matches > 0 && i === index - matches + 1 ? 'l' : ''}{index >= 0 && i === index + m ? 'r' : ''}
            </small></div>
        })}
      </div>
      <p>Matches in a row: <strong>{matches}</strong> of {need} needed (gap m = {m}). The run of matches runs from l to r (positions shifted by m).</p>
      <p>{found ? 'The repeated block has been found.' : 'The block has not been found yet.'}</p>
      <p>Pattern length {run.input.m}, repeated {run.input.k} times or more.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> a block of k copies of a length-m pattern is the same as a stretch of (k-1) times m consecutive positions where each value equals the one m places later.</p>
    <p><strong>One pass:</strong> keep the length of the current stretch of matches; the first time it reaches (k-1) times m, the answer is yes.</p>
  </>} />
}
