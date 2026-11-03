import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '158',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with file (string) and calls (JSON list of counts)',
  url: 'https://leetcode.com/problems/read-n-characters-given-read4-ii-call-multiple-times/',
  complexity: 'O(n) per call, where n is the number of characters requested. Each read4 call fetches at most four characters and cached leftovers are reused.',
  examples: [
    { label: 'Sample A', input: '{"file":"abcdefghij","calls":[3,5,2,9]}' },
    { label: 'Exact fours', input: '{"file":"wxyzqrst","calls":[4,4,1]}' },
    { label: 'Short file', input: '{"file":"hi","calls":[1,5]}' },
  ],
}

export default function ReadNCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { file } = run.input
    const { pos, cache, out, results, call, n } = step.snapshot
    return <>
      <div role="img" aria-label="File characters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {file.split('').map((c, k) => <div key={k} data-index={k} style={{
          minWidth: 30, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${k === pos - 1 ? 2 : 1}px solid ${k < pos ? 'var(--text)' : 'var(--border)'}`,
          background: k < pos ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}>{c}</div>)}
      </div>
      <p>File position: {pos} of {file.length}. Cache: <code>{cache || '(empty)'}</code></p>
      <p>Call {call + 1} of {run.input.calls.length} asked for {n}; output so far: <code>{out || '(nothing yet)'}</code></p>
      <ol>{results.map((r, k) => <li key={k}>Call {k + 1}: <code>{r}</code></li>)}</ol>
    </>
  }} renderReasoning={() => <>
    <p><strong>Cache first:</strong> characters left over from an earlier read4 are kept so the next call does not lose them.</p>
    <p><strong>Stop at the end:</strong> when read4 returns nothing, the call returns whatever it already has.</p>
  </>} />
}
