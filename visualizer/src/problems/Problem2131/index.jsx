import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2131',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Two-letter words as a JSON array',
  url: 'https://leetcode.com/problems/longest-palindrome-by-concatenating-two-letter-words/',
  complexity: 'O(n) time with a count per word; O(n) space.',
  examples: [
    { label: 'Mirror pairs', input: '["ab","ba","ca","ac","zz"]' },
    { label: 'Doubled letters', input: '["qq","qq","qq","rs"]' },
    { label: 'Only middle', input: '["aa"]' }, { label: "Single word", input: "[\"ab\"]" }, { label: "Equal words", input: "[\"aa\",\"aa\"]" }, { label: "Largest list", input: "[\"aa\",\"bh\",\"co\",\"dv\",\"ec\",\"fj\",\"gq\",\"hx\",\"ie\",\"jl\",\"ks\",\"lz\",\"mg\",\"nn\",\"ou\",\"pb\",\"qi\",\"rp\",\"sw\",\"td\",\"uk\",\"vr\",\"wy\",\"xf\",\"ym\",\"zt\",\"aa\",\"bh\",\"co\",\"dv\",\"ec\",\"fj\",\"gq\",\"hx\",\"ie\",\"jl\",\"ks\",\"lz\",\"mg\",\"nn\"]" }, { label: "Long run: 40 words", input: "[\"tc\",\"xc\",\"bw\",\"wf\",\"zs\",\"cx\",\"sz\",\"qn\",\"gm\",\"bo\",\"bz\",\"qi\",\"we\",\"pn\",\"sp\",\"dk\",\"av\",\"vk\",\"uq\",\"em\",\"qs\",\"bw\",\"qb\",\"wj\",\"bc\",\"ix\",\"qr\",\"fl\",\"hj\",\"ur\",\"vi\",\"hy\",\"fw\",\"yd\",\"ex\",\"mw\",\"vd\",\"xy\",\"ui\",\"fv\"]" },
  ],
}

export default function Problem2131Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Input words; the word being doubled is current" length={run.input.words.length} active={run.input.words.indexOf(step.current)} valueAt={i => run.input.words[i]} roleAt={i => (run.input.words[i] === run.input.words[i].split('').reverse().join('') ? 'palindrome' : '')} />
          <RecordStateTable label="Word counts and pairing" columns={['word', 'count', 'used']} rows={step.rows} activeRow={step.rows.findIndex(r => r.word === step.current)} />
          <p>Length so far: {step.length}{step.middle ? ' · a middle word is available' : ''}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
