import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '126',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'beginWord, endWord and wordList (JSON)',
  url: 'https://leetcode.com/problems/word-ladder-ii/',
  complexity: 'O(N * L * 26) time for N words of length L to build the layers, plus the output size for the paths. Space is O(N * L) for parents and layers.',
  examples: [
    { label: 'Three ladders', input: '{"beginWord":"cold","endWord":"warm","wordList":["cord","card","ward","word","worm","warm","wood"]}' },
    { label: 'One step', input: '{"beginWord":"pen","endWord":"pan","wordList":["pan","pin","pen","ten"]}' },
    { label: 'No ladder', input: '{"beginWord":"aaa","endWord":"zzz","wordList":["aab","abb"]}' },
  ],
}

export default function WordLadderII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { layer = [], focus, paths = [], beginWord, endWord } = step.snapshot
    return <>
      <p><strong>Current layer:</strong> {layer.length ? layer.map(w => <code key={w} style={{ marginRight: 8 }}>{w}</code>) : 'none'}</p>
      {focus && <p>Expanding <code>{focus}</code>.</p>}
      {paths.length > 0 && <ol aria-label="Sequences found" style={{ fontFamily: 'monospace' }}>
        {paths.map((p, i) => <li key={i}>{p.join(' → ')}</li>)}
      </ol>}
      <p style={{ color: 'var(--muted, #64748b)' }}>Start {beginWord}, goal {endWord}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Shortest layers:</strong> breadth-first search reaches each word at its shortest distance. A word can only be a parent of a later word if it sits exactly one layer earlier, so all shortest routes are kept without extra ones.</p>
    <p><strong>Walk back:</strong> starting from the end word, follow parent links to the begin word. Each complete walk is one shortest sequence, and the output is every such walk.</p>
  </>} />
}
