import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Walls, source and target (JSON object)',
  url: 'https://leetcode.com/problems/escape-a-large-maze/',
  complexity: 'Each search stops after about k(k−1)/2 + 1 cells, where k ≤ 200 blocked cells.',
  examples: [
    { label: 'Corner trapped', input: '{"blocked":[[0,1],[1,0]],"source":[0,0],"target":[5,5]}' },
    { label: 'Triangle pocket', input: '{"blocked":[[2,0],[1,1],[0,2]],"source":[0,0],"target":[9,9]}' },
    { label: 'One wall', input: '{"blocked":[[0,1]],"source":[0,0],"target":[9,9]}' },
  ],
}

const RADIUS = 5

function LargeMaze() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const centre = s.current || s.origin
    const walls = new Set(run.input.blocked ? run.input.blocked.map(([r, c]) => `${r},${c}`) : [])
    const cells = []
    for (let r = centre[0] - RADIUS; r <= centre[0] + RADIUS; r++) {
      for (let c = centre[1] - RADIUS; c <= centre[1] + RADIUS; c++) {
        if (r < 0 || c < 0 || r >= 1000000 || c >= 1000000) { cells.push({ r, c, kind: 'off' }); continue }
        const key = `${r},${c}`
        const kind = walls.has(key) ? 'wall' : r === centre[0] && c === centre[1] ? 'current' : r === s.goal[0] && c === s.goal[1] ? 'goal' : 'open'
        cells.push({ r, c, kind })
      }
    }
    const span = 2 * RADIUS + 1
    return <>
      <p>Only a {span} × {span} window around the current cell is drawn. The grid itself has 1,000,000 rows and columns.</p>
      <p>Status: <strong>{s.status ?? 'setup'}</strong> · cells seen {s.seen} of limit {s.limit}{s.result !== undefined ? ` · answer ${s.result ? 'yes' : 'no'}` : ''}</p>
      <div role="grid" aria-label="Local window of the maze" style={{ display: 'grid', gridTemplateColumns: `repeat(${span}, 22px)`, gap: 2 }}>
        {cells.map(({ r, c, kind }) => <div key={`${r},${c}`} role="gridcell" title={`(${r}, ${c})`} data-kind={kind}
          style={{ width: 22, height: 22, fontSize: 10, textAlign: 'center', lineHeight: '22px', border: '1px solid var(--border)',
            background: kind === 'wall' ? 'var(--text-muted)' : kind === 'current' ? 'var(--primary)' : kind === 'goal' ? 'var(--success)' : kind === 'off' ? 'transparent' : 'var(--surface2)' }}>
          {kind === 'current' ? '●' : kind === 'goal' ? 'G' : ''}</div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p>Blocked cells are few, so a region they enclose cannot hold more than k(k − 1)/2 cells. If a search from one end gets past that count, that end is outside any enclosure.</p>
    <p>Two searches with a count limit decide the answer; the full grid is never visited.</p>
  </>} />
}

export default withProblemStory(LargeMaze, storyGuide);
