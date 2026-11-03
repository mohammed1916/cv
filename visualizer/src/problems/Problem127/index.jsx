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
    return <>
      <p>{word === null ? 'Building wildcard buckets.' : `Current word: "${word}" at depth ${depth}`}</p>
      {pattern && <p>Pattern: <code>{pattern}</code> holds {bucket.length === 0 ? 'no unseen words' : bucket.join(', ')}</p>}
      <p>Queue: {queue.length ? queue.join(', ') : 'empty'}</p>
      <p>Visited: {visited.join(', ')}</p>
      {result > 0 && <p>Result so far: {result}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Breadth-first order:</strong> the first time the end word is dequeued, its depth is the shortest ladder length.</p>
    <p><strong>Wildcard buckets:</strong> words that differ in one letter share a pattern, so neighbours are found without comparing every pair. A bucket is cleared after use.</p>
  </>} />
}
