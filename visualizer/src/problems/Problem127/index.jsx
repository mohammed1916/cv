import LinkedListLane from '../../components/shared/LinkedListLane'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '127',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with beginWord, endWord and wordList (JSON)',
  url: 'https://leetcode.com/problems/word-ladder/',
  complexity: 'With L-letter words and N words, building buckets costs O(N L) and each bucket is scanned once.',
  examples: [
    { label: 'Short ladder', input: '{"beginWord":"cat","endWord":"dog","wordList":["cot","dot","dog"]}' },
    { label: 'Direct neighbour', input: '{"beginWord":"ab","endWord":"ad","wordList":["ac","ad"]}' },
    { label: 'Disconnected', input: '{"beginWord":"aaa","endWord":"bbb","wordList":["xxx","bbb"]}' },
  ],
}

export default function WordLadder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { word, depth, pattern, bucket, queue, visited, result } = step.snapshot
    const seen = new Set(visited)
    const chip = (text, style = {}) => <span key={text} style={{ display: 'inline-block', margin: 3, padding: '3px 8px', borderRadius: 999, border: '1px solid var(--border)', fontFamily: 'monospace', ...style }}>{text}</span>
    return <>
      <LinkedListLane title="Queue (front on the left)" nodes={queue.map((w, i) => ({ id: `q${i}`, value: w }))}
        pointers={queue.length ? [{ id: 'q0', label: 'front', tone: 'info' }] : []}
        roles={word !== null ? Object.fromEntries(queue.map((w, i) => [`q${i}`, w === word ? 'active' : ''])) : {}}
        note={word === null ? 'Building wildcard buckets.' : `Dequeued "${word}" at depth ${depth}.`} />
      <p>Visited words: {visited.map(w => chip(w, { background: 'var(--surface2)' }))}</p>
      {pattern && <div>
        <p>Bucket <code>{pattern}</code>: {bucket.length === 0 ? 'no words, or already cleared' : bucket.map(w => chip(w, { background: seen.has(w) ? 'var(--surface2)' : 'transparent', borderStyle: seen.has(w) ? 'solid' : 'dashed' }))}</p>
        <small>Solid: already seen. Dashed: unseen and enqueued at the next depth.</small>
      </div>}
      {result > 0 && <p>Result so far: {result}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Breadth-first order:</strong> the first time the end word is dequeued, its depth is the shortest ladder length.</p>
    <p><strong>Wildcard buckets:</strong> words that differ in one letter share a pattern, so neighbours are found without comparing every pair. A bucket is cleared after use.</p>
  </>} />
}
