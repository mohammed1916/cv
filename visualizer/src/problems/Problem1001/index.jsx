import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up empty counters for lines and an empty lamp set.' },
    { id: 'index', label: 'Index lamp', description: 'Add each lamp to its row, column, diagonal and anti-diagonal counts.' },
    { id: 'query', label: 'Query', description: 'Check the four lines through the query cell, then record 1 or 0.' },
    { id: 'off', label: 'Turn off', description: 'Switch off lamps in the 3x3 block around the query.' },
    { id: 'done', label: 'Complete', description: 'Return the recorded answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, lamps and queries (JSON)',
  url: 'https://leetcode.com/problems/grid-illumination/',
  complexity: 'O(L + Q) expected time with hash maps, where L is the number of lamps and Q the queries. Each lamp goes off at most once. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"lamps":[[0,0],[4,4]],"queries":[[1,1],[1,0]]}' },
    { label: 'Shared diagonal', input: '{"n":5,"lamps":[[0,0],[4,4]],"queries":[[1,1],[1,1]]}' },
    { label: 'Single cell', input: '{"n":1,"lamps":[[0,0]],"queries":[[0,0],[0,0]]}' },
  ],
}

export default function GridIllumination() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n } = run.input
    const lampKeys = new Set(step.on.map(([r, c]) => `${r},${c}`))
    const offKeys = new Set(step.cells.map(([r, c]) => `${r},${c}`))
    const isQuery = (r, c) => step.query !== null && step.query[0] === r && step.query[1] === c
    return <>
      <div aria-label="Grid" role="img" style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 40px)`, gap: 4, fontFamily: 'monospace', width: 'max-content' }}>
        {Array.from({ length: n * n }, (_, index) => {
          const r = Math.floor(index / n)
          const c = index % n
          const key = `${r},${c}`
          const lamp = lampKeys.has(key)
          const off = offKeys.has(key)
          const query = isQuery(r, c)
          const background = lamp ? '#facc15' : off ? 'var(--surface2)' : 'transparent'
          return <div key={key} data-cell={key} style={{
            width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center',
            borderWidth: query ? 2 : 1, borderStyle: off ? 'dashed' : 'solid', borderColor: query ? 'var(--text)' : 'var(--border)',
            background, fontSize: '.7rem', color: lamp ? '#1c1917' : 'var(--text-dim)',
          }}>{lamp ? 'L' : `${r},${c}`}</div>
        })}
      </div>
      <output aria-label="Answers">{`Answers so far: [${step.answer.join(', ')}]`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Four counters per lamp:</strong> row, column, diagonal r − c and anti-diagonal r + c. A query is lit exactly when one of its four counters is positive.</p>
    <p><strong>Clearing the block:</strong> the 3x3 neighbours of a query are checked against the lamp set. Each lamp that goes off decrements its four counters, so it is never scanned again.</p>
  </>} />
}
