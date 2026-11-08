import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Finished', description: 'Mark the states that are already decided.' },
    { id: 'layer', label: 'Propagate', description: 'Decide states whose moves all lead to decided outcomes.' },
    { id: 'done', label: 'Complete', description: 'Report whether the mouse wins from the start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with grid, catJump and mouseJump, for example {"grid": ["M.C...F"], "catJump": 1, "mouseJump": 4}',
  url: 'https://leetcode.com/problems/cat-and-mouse-ii/',
  complexity: 'O((rows * cols)^2 * moves) states. The visualization caps the board at 8 by 8.',
  examples: [
    { label: 'Own case 1', input: '{"grid":["M....","#C...","####F"],"catJump":1,"mouseJump":2}' },
    { label: 'Example 2', input: '{"grid":["M.C...F"],"catJump":1,"mouseJump":4}' },
    { label: 'Example 3', input: '{"grid":["M.C...F"],"catJump":1,"mouseJump":3}' },
  { label: 'Adjacent start', input: '{"grid":["CMF"],"catJump":1,"mouseJump":1}' },
  { label: 'Walls in between', input: '{"grid":["C#M#F"],"catJump":1,"mouseJump":1}' },
  { label: 'Long jumps', input: '{"grid":["C.M..F"],"catJump":2,"mouseJump":3}' },
  { label: 'Long run: 8 by 8 board', input: '{"grid":["M#..#.#.","...#....","...#.#.#","...#.C.#","...#....","......#.","#.F.##.#","....#..."],"catJump":2,"mouseJump":3}' },
  ],
}

// Board cells: walls, floor, food, and the two pieces. Each piece has a letter and its own colour role.
function cellStyle(ch) {
  const base = { width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontWeight: 700, borderRadius: 6, border: '1px solid var(--border)' }
  if (ch === '#') return { ...base, background: 'var(--text)', color: 'var(--surface)' }
  if (ch === 'F') return { ...base, background: 'var(--primary)', color: 'var(--surface)' }
  if (ch === 'M' || ch === 'C') return { ...base, background: 'var(--surface2)', color: 'var(--text)', borderWidth: 2, borderColor: 'var(--primary)' }
  return { ...base, background: 'var(--surface)', color: 'var(--text-muted, var(--text))' }
}

export default function CatAndMouse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rows = run.input.grid
    const layers = run.frames.filter(frame => frame.phase === 'layer')
    return <>
      <div role="img" aria-label="Board" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${rows[0].length}, 40px)`, gap: 4, marginBottom: 10 }}>
        {rows.join('').split('').map((ch, i) => <span key={i} style={cellStyle(ch)}>{ch === '.' ? '' : ch}</span>)}
      </div>
      <output aria-label="Decided states" style={{ display: 'block' }}>{`Decided states: ${step.decided}, after ${step.depth} moves`}</output>
      {layers.length > 0 && <table aria-label="Decisions by depth" style={{ borderCollapse: 'collapse', marginTop: 10, fontFamily: 'monospace' }}>
        <thead><tr><th style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>after moves</th><th style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>total decided</th></tr></thead>
        <tbody>{layers.map((layer, i) => {
          const current = layer === step
          return <tr key={i} style={{ background: current ? 'var(--surface2)' : undefined, fontWeight: current ? 700 : 400 }}>
            <td style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>{layer.depth}</td>
            <td style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>{layer.decided}</td>
          </tr>
        })}</tbody>
      </table>}
    </>
  }} renderReasoning={() => <>
    <p>A state is a mouse cell, a cat cell and whose turn it is. Work backwards from finished states: a mouse-turn state is won by the mouse if some move reaches a mouse win, and a cat-turn state is won by the mouse only if every cat move does.</p>
    <p>Any state still undecided at the end is a draw, which counts as a cat win.</p>
  </>} />
}
