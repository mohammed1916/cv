import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '157',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with file text and n (JSON)',
  url: 'https://leetcode.com/problems/read-n-characters-given-read4/',
  complexity: 'O(n) time: each read4 call returns up to four characters, so about n / 4 calls are made.',
  examples: [
    { label: 'Rhythm', input: '{"file":"rhythm","n":4}' },
    { label: 'Longer than file', input: '{"file":"ab","n":5}' },
    { label: 'Exact chunks', input: '{"file":"stonefish","n":8}' },
  ],
}

const cell = active => ({
  minWidth: 30, boxSizing: 'border-box', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})

export default function ReadNCharactersGivenRead4() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { pointer, answer, n, chunk, k } = step.snapshot
    const file = run.input.file
    const chunkStart = pointer - (k ?? 0)
    return <>
      <p>File pointer: <strong>{pointer}</strong> of {file.length}. Wanted: {n}.</p>
      <div role="img" aria-label="File characters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...file].map((ch, i) => <div key={i} style={cell(k && i >= chunkStart && i < pointer)}>{ch}<small> {i}</small></div>)}
      </div>
      <p>read4 buffer: {chunk.length ? <code>{chunk.join('')}</code> : 'empty'} {k !== null && k !== undefined ? `(${k} characters)` : ''}</p>
      <p>Answer so far: <code>{answer || '(nothing yet)'}</code></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Buffer, then copy:</strong> read4 always writes into a four-slot buffer, so we copy from the buffer only the characters still needed.</p>
    <p><strong>Short read:</strong> if read4 returns fewer than four characters, the file has ended, so there is no reason to call again.</p>
  </>} />
}
