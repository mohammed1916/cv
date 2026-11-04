import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Clear', description: 'No letter is bold yet.' },
    { id: 'match', label: 'Occurrence', description: 'Bold the letters of this occurrence of a word.' },
    { id: 'done', label: 'Wrap runs', description: 'Adjacent bold letters share one tag pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words and string (JSON)',
  url: 'https://leetcode.com/problems/bold-words-in-string/',
  complexity: 'O(words * n * length) time with direct comparison. The visualization caps input at 10 words and 50 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["ab","bc"],"s":"aabcd"}' },
    { label: 'Whole word', input: '{"words":["abc","def"],"s":"abcdef"}' },
  ],
}

export default function BoldWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // Every occurrence of every word is a span [start, start + length) on the string.
    const spans = []
    for (const word of run.input.words) {
      for (let i = run.s.indexOf(word); i >= 0; i = run.s.indexOf(word, i + 1)) {
        const current = step.at === i && step.word === word
        spans.push({ start: i, end: i + word.length, label: word, role: current ? 'current' : 'pending' })
      }
    }
    const { interval } = intervalView({ title: 'Word occurrences on the string', intervals: spans, note: 'Bold letters are the union of these spans.' })
    return <>
      {interval && <IntervalView {...interval} />}
      <IndexedSequence label="Letters (bold ones are marked)" length={run.s.length} active={step.at ?? -1}
        valueAt={i => run.s[i]} roleAt={i => (step.bold[i] ? 'read' : '')} />
      <output aria-label="Result">{step.result === null ? `Latest occurrence: ${step.word ?? 'none yet'}` : step.result}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each occurrence of a word marks its letters. Overlapping or adjacent occurrences just mark more letters, so no tag pair is ever nested.</p>
    <p>The final string wraps each maximal run of bold letters in one pair of tags.</p>
  </>} />
}
