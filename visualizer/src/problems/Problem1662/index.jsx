import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1662',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word1 and word2 as arrays of chunks (JSON)',
  url: 'https://leetcode.com/problems/check-if-two-string-arrays-are-equivalent/',
  complexity: 'O(n) time and O(1) extra space: walk both chunk lists with two cursors, or join and compare once.',
  examples: [
    { label: 'Same text, different chunks', input: '{"word1":["xy","z"],"word2":["x","yz"]}' },
    { label: 'Same length, different letter', input: '{"word1":["ab","c"],"word2":["ac","b"]}' },
    { label: 'Longer second array', input: '{"word1":["ab"],"word2":["abc"]}' },
  ],
}

const cell = { padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center' }

export default function ArrayStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { left, right, matched, mismatch } = step.snapshot
    const { word1, word2 } = run.input
    const chunkView = (chunks, active, label) => <div>
      <strong>{label}</strong>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
        {chunks.map((chunk, ci) => <span key={ci} style={{ ...cell, display: 'inline-flex', gap: 2 }}>
          {[...chunk].map((ch, pos) => <span key={pos} style={{
            padding: '0 2px',
            background: active && active.chunk === ci && active.pos === pos ? 'var(--primary)' : 'transparent',
            color: active && active.chunk === ci && active.pos === pos ? 'var(--text-inverse)' : 'var(--text)',
          }}>{ch}</span>)}
        </span>)}
      </div>
    </div>
    return <>
      {chunkView(word1, left, 'word1 (pointer l)')}
      {chunkView(word2, right, 'word2 (pointer r)')}
      <p>Matched characters: {matched}{mismatch ? ' · mismatch' : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Only the spelled text matters:</strong> chunk boundaries can fall anywhere, so the comparison walks characters, not chunks.</p>
    <p><strong>Two cursors:</strong> advancing one character on each side and stopping at the first difference or the first end detects equivalence in one pass.</p>
  </>} />
}
