import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1656',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and inserts (JSON)',
  url: 'https://leetcode.com/problems/design-an-ordered-stream/',
  complexity: 'O(n) total time across all insertions: the pointer only moves forward, and each slot is released once.',
  examples: [
    { label: 'Scrambled arrivals', input: '{"n":5,"inserts":[[3,"c"],[1,"a"],[2,"b"],[5,"e"],[4,"d"]]}' },
    { label: 'Exact order', input: '{"n":3,"inserts":[[1,"x"],[2,"y"],[3,"z"]]}' },
    { label: 'First slot late', input: '{"n":4,"inserts":[[4,"d"],[3,"c"],[1,"a"],[2,"b"]]}' },
  ],
}

export default function DesignOrderedStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, slots, pointer, key, value, chunk, output } = step.snapshot
    return <>
      <div role="img" aria-label="Stream slots" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, i) => {
          const id = i + 1
          const filled = slots[i] !== null
          return <div key={id} data-slot={id} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${id === pointer ? 2 : 1}px solid ${id === key ? 'var(--text)' : 'var(--border)'}`,
            background: chunk?.includes(slots[i]) && filled ? '#bbf7d0' : filled ? 'var(--surface2)' : 'transparent',
            color: 'var(--text)',
          }}><div>{filled ? slots[i] : '·'}</div><small>id {id}</small></div>
        })}
      </div>
      <p>{key === null ? 'Waiting for the first insertion.' : `Inserted ${value} at id ${key}. Pointer waits at id ${pointer}.`}</p>
      <p>Released chunks: {output.length ? output.map(c => `[${c.join(', ')}]`).join(' ') : 'none yet'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Store by id:</strong> a value waits in its own slot until every earlier id has been released.</p>
    <p><strong>Release a run:</strong> after each insertion, the pointer moves forward only while the next slot is filled.</p>
  </>} />
}
