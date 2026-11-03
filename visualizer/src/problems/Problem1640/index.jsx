import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'JSON object with arr and pieces',
  url: 'https://leetcode.com/problems/check-array-formation-through-concatenation/',
  complexity: 'O(n) time after indexing the pieces, O(n) extra space.',
  examples: [
    { label: 'Reorder', input: '{"arr":[5,7,9,2],"pieces":[[7,9],[5],[2]]}' },
    { label: 'Interleaved', input: '{"arr":[1,2,3],"pieces":[[1,3],[2]]}' },
    { label: 'Single', input: '{"arr":[4,8,15,16],"pieces":[[16],[4,8],[15]]}' },
  ],
}

function Chip({ value, active, matched }) {
  return <span data-active={active} data-matched={matched}
    style={{ display: 'inline-block', minWidth: 28, textAlign: 'center', padding: '4px 6px', margin: 2, borderRadius: 4,
      border: '1px solid currentColor', background: active ? '#bae6fd' : matched ? '#bbf7d0' : 'transparent' }}>{value}</span>
}

function Formation({ snapshot }) {
  const { arr, pieces, i, piece, used, matched } = snapshot
  return <>
    <div role="group" aria-label="arr positions">
      {arr.map((v, k) => <Chip key={k} value={v} active={k === i} matched={i !== null && piece !== null && k >= i && k < i + pieces[piece].length && k < i + matched} />)}
    </div>
    <div role="group" aria-label="Pieces">
      {pieces.map((p, idx) => <span key={idx} data-used={used.includes(idx)} style={{ display: 'inline-block', margin: 4, padding: 4, opacity: used.includes(idx) ? 0.45 : 1, border: '1px dashed currentColor', borderRadius: 6 }}>
        {p.map((v, k) => <Chip key={k} value={v} active={idx === piece && i !== null && k < matched} />)}
      </span>)}
    </div>
  </>
}

function PieceFormation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <Formation snapshot={step.snapshot} />
    <p>Pieces used so far: {step.snapshot.used.length} of {step.snapshot.pieces.length}.</p>
  </>} renderReasoning={() => <>
    <p>Every piece has a distinct first value, so the value at the current position identifies the only piece that could start there.</p>
    <p>Pieces keep their own internal order. Only the order of whole pieces may change.</p>
  </>} />
}

export default withProblemStory(PieceFormation, storyGuide)
