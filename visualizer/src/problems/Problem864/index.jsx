import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PagedGrid from '../../components/shared/PagedGrid'
import { BitmaskLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start state: the @ cell with no keys.' },
    { id: 'pop', label: 'Pop state', description: 'Take the next (row, column, keys) state.' },
    { id: 'blocked', label: 'Locked door', description: 'A lock without its key blocks the move.' },
    { id: 'push', label: 'Enqueue state', description: 'A new (cell, keys) state is reached.' },
    { id: 'done', label: 'Complete', description: 'All keys collected, or unreachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid rows (JSON array of strings, up to 8 x 8)',
  url: 'https://leetcode.com/problems/shortest-path-to-get-all-keys/',
  complexity: 'O(m * n * 2^k) states, each with 4 moves; k up to 6 keys.',
  examples: [
    { label: 'Official example 1', input: '["@.a..","###.#","b.A.B"]' },
    { label: 'Official example 2', input: '["@..aA","..B#.","....b"]' },
    { label: 'Unreachable', input: '["@Aa"]' },
    { label: 'Two keys, no locks', input: '["@.a",".#.","b.."]' },
  ],
}

export default function ShortestPathAllKeys() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = run.input
    const visited = new Set()
    for (let i = 0; i <= (step.popped ?? -1); i++) visited.add(`${run.pops[i][0]},${run.pops[i][1]}`)
    const k = grid.join('').split('').filter(ch => ch >= 'a' && ch <= 'f').length
    const held = [...Array(k).keys()].filter(i => (step.mask >> i) & 1).map(i => String.fromCharCode(97 + i))
    return <>
      <PagedGrid label="Maze" rows={grid.length} columns={grid[0].length} cellAt={(r, c) => {
        const ch = grid[r][c]
        const here = r === step.r && c === step.c
        const target = r === step.tr && c === step.tc
        const role = here ? 'current' : target ? 'pending' : visited.has(`${r},${c}`) ? 'visited' : ch === '#' ? 'wall' : ''
        return { role, value: ch, label: here ? 'robot' : target ? 'considering' : visited.has(`${r},${c}`) ? 'reached' : ch === '#' ? 'wall' : 'free',
          detail: `${ch === '#' ? 'wall' : ch === '.' ? 'open floor' : ch === '@' ? 'start' : /[a-f]/.test(ch) ? `key ${ch}` : `lock ${ch}`}${visited.has(`${r},${c}`) ? '; visited by some state' : ''}` }
      }} />
      <BitmaskLane title="Keys held by the popped state" entries={[{ label: `mask ${(step.mask ?? 0).toString(2)}`, letters: held.join('') }]} active={[0]} />
      <output aria-label="Distance">Distance: {step.steps ?? 0}; queued states: {step.queueSize ?? 0}; seen states: {step.seenSize ?? 0}</output>
      {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Why bitmask states:</strong> standing on the same cell with different keys is a different situation, because different doors are open. So BFS runs over (row, column, keys) triples.</p>
    <p><strong>Why BFS:</strong> every move costs one, so the first state holding every key is reached with the fewest moves.</p>
    <p>A door is passable only if its key bit is set in the mask; picking up a key sets its bit with OR.</p>
  </>} />
}
