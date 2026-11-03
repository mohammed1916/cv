import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Two strings as a JSON array, e.g. ["aba","baba"]',
  url: 'https://leetcode.com/problems/count-substrings-that-differ-by-one-character/',
  complexity: 'O(|s| · |t| · min(|s|, |t|)) time for these short inputs; O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '["aba","baba"]' },
    { label: 'Identical', input: '["abc","abc"]' },
    { label: 'Short', input: '["ab","ba"]' },
  ],
}

function Row({ text, from, length, mismatchAt, label }) {
  return <div role="group" aria-label={label} style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
    {[...text].map((ch, k) => {
      const inWindow = from !== null && k >= from && k < from + length
      const bad = mismatchAt && mismatchAt.includes(k)
      return <span key={k} data-in-window={inWindow} data-mismatch={bad}
        style={{ width: 28, height: 28, lineHeight: '28px', textAlign: 'center', border: '1px solid currentColor', borderRadius: 4,
          background: bad ? '#fecaca' : inWindow ? '#bae6fd' : 'transparent' }}>{ch}</span>
    })}
  </div>
}

function DiffGrid({ snapshot }) {
  const { s, t, i, j, length, mismatches } = snapshot
  const aligned = i !== null && j !== null && length > 0
  const mismatchS = aligned ? [...Array(length).keys()].filter(k => s[i + k] !== t[j + k]).map(k => i + k) : []
  const mismatchT = aligned ? [...Array(length).keys()].filter(k => s[i + k] !== t[j + k]).map(k => j + k) : []
  return <>
    <Row text={s} from={aligned ? i : null} length={length} mismatchAt={mismatchS} label="String s" />
    <Row text={t} from={aligned ? j : null} length={length} mismatchAt={mismatchT} label="String t" />
    <p>{aligned ? `Window length ${length}, mismatches ${mismatches}.` : 'Choose a start pair to see a window.'}</p>
  </>
}

function OneMismatchCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DiffGrid snapshot={step.snapshot} />
    <output aria-label="Pairs counted so far">Counted: {step.snapshot.total}</output>
  </>} renderReasoning={() => <>
    <p>A pair is fixed by its two start positions and its length. Extending both starts one character at a time keeps the pair aligned.</p>
    <p>Once a pair has two mismatches, every longer pair from the same starts also has at least two, so the extension stops.</p>
  </>} />
}

export default withProblemStory(OneMismatchCount, storyGuide)
