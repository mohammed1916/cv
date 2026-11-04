import LinkedListLane from '../../components/shared/LinkedListLane'
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
    const { layer = [], focus, paths = [], beginWord, endWord, layers = [], path = null } = step.snapshot
    const chip = (text, style = {}) => <code key={text} style={{ display: 'inline-block', margin: 3, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', ...style }}>{text}</code>
    return <>
      <div role="list" aria-label="Breadth-first layers">
        {layers.map((words, d) => <div key={d} role="listitem" style={{ margin: '6px 0' }}>
          <small>Distance {d}</small> {words.map(w => chip(w, {
            borderStyle: w === focus ? 'solid' : 'dashed', borderWidth: w === focus ? 2 : 1,
            background: w === focus ? 'var(--surface2)' : 'transparent',
          }))}
        </div>)}
      </div>
      <p><strong>Current layer:</strong> {layer.length ? layer.map(w => <code key={w} style={{ marginRight: 8 }}>{w}</code>) : 'none'}</p>
      {focus && <p>Expanding <code>{focus}</code>.</p>}
      {path && <LinkedListLane title="Walking back from the end word" nodes={path.map((w, i) => ({ id: `p${i}`, value: w }))}
        roles={{ p0: 'active' }} note="Walk order: the word being stepped from comes first, the end word last." />}
      {paths.length > 0 && <ol aria-label="Sequences found" style={{ fontFamily: 'monospace' }}>
        {paths.map((p, i) => <li key={i}>{p.join(' → ')}</li>)}
      </ol>}
      <p style={{ color: 'var(--text-muted)' }}>Start {beginWord}, goal {endWord}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Shortest layers:</strong> breadth-first search reaches each word at its shortest distance. A word can only be a parent of a later word if it sits exactly one layer earlier, so all shortest routes are kept without extra ones.</p>
    <p><strong>Walk back:</strong> starting from the end word, follow parent links to the begin word. Each complete walk is one shortest sequence, and the output is every such walk.</p>
  </>} />
}
