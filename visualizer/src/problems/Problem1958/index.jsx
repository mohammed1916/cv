import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1958',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with board (8 strings), rMove, cMove and color (e.g. {"board":["W B......"],"rMove":0,"cMove":2,"color":"W"})',
  url: 'https://leetcode.com/problems/check-if-move-is-legal/',
  complexity: 'O(1): at most eight rays of seven cells each on a fixed 8 by 8 board.',
  examples: [
    { label: 'Row closes', input: '{"board":["WB......","........","........","........","........","........","........","........"],"rMove":0,"cMove":2,"color":"W"}' },
    { label: 'Diagonal closes', input: '{"board":["W.......",".B......","..B.....","........","........","........","........","........"],"rMove":3,"cMove":3,"color":"W"}' },
    { label: 'Empty board', input: '{"board":["........","........","........","........","........","........","........","........"],"rMove":0,"cMove":0,"color":"W"}' },
    { label: 'Move in the corner', input: '{"board":["W.......","........","........","........","........","........","........","........"],"rMove":7,"cMove":7,"color":"B"}' },
    { label: 'Long run: busy board', input: '{"board":[".....BWW","...BW.BB",".B.BBBB.",".WW..WW.","WWB..W.W","WWWBWW..",".BW.WW..","B..BWW.."],"rMove":5,"cMove":4,"color":"B"}' },
  ],
}

export default function Problem1958Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const rayKeys = new Set(step.ray.map(([r, c]) => `${r},${c}`))
      return <>
        <table aria-label="Board" style={{ borderCollapse: 'collapse' }}>
          <tbody>{run.input.board.map((row, r) => <tr key={r}>{[...row].map((ch, c) => {
            const isMove = r === step.cell[0] && c === step.cell[1]
            const onRay = rayKeys.has(`${r},${c}`)
            return <td key={c} style={{ width: 30, height: 30, textAlign: 'center', border: '1px solid var(--border)', fontWeight: 700,
              background: isMove ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : onRay ? (step.closes ? 'color-mix(in srgb, var(--success) 25%, var(--surface2))' : 'color-mix(in srgb, var(--primary) 12%, var(--surface2))') : 'var(--surface2)' }}>{ch === '.' ? '' : ch}</td>
          })}</tr>)}</tbody>
        </table>
        <p>Blue cell: the proposed move. Shaded cells: the ray being walked.</p>
        {step.result !== null && <output aria-label="Legal">Legal: {step.result ? 'yes' : 'no'}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
