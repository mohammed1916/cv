import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"words":[...],"chars":"..."}',
  complexity: 'O(total word length + chars) time with O(26) counts. The trace accepts up to 6 words of up to 6 letters and 20 supply letters.',
  examples: [
    { label: 'Three words', input: '{"words":["ab","bc","abc"],"chars":"abcc"}' },
    { label: 'Missing copy', input: '{"words":["aa","b"],"chars":"a"}' },
    { label: 'Exact fit', input: '{"words":["xyz","xyzz"],"chars":"xyzy"}' },
    { label: 'Single letter fits', input: '{"words":["a"],"chars":"a"}' },
    { label: 'Missing copies give zero', input: '{"words":["aa"],"chars":"a"}' },
    { label: 'Shared letters across two words', input: '{"words":["aab","b"],"chars":"aaabb"}' },
    { label: 'Long run: 6 words, 20 letters', input: '{"words":["bddbc","badebe","eaada","cca","cdeec","acdaa"],"chars":"aedcebccecbecbedbacc"}' },
  ],
}

export default function FormableWordsWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      const letters = Object.keys(s.supply).sort()
      const rows = letters.map(letter => ({ letter, supply: s.supply[letter], 'used by this word': s.used[letter] ?? 0 }))
      const marks = {}
      s.verdicts.forEach((verdict, index) => { marks[index] = verdict.ok ? 'written' : 'pending' })
      return <>
        <Sequence label="Words (green accepted, dashed skipped)" values={s.words} pointers={s.wordIndex >= 0 ? { word: s.wordIndex } : {}} marks={marks} />
        <RecordStateTable label="Letter supply and use by the current word" columns={['letter', 'supply', 'used by this word']} rows={rows} />
        <Vars vars={{ 'word being checked': s.wordIndex >= 0 ? s.words[s.wordIndex] : null, 'letter position': s.position >= 0 ? s.position : null, 'total length accepted': s.total }} />
        <p>{step.message}</p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
