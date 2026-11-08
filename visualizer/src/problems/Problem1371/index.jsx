import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Text (JSON object with s)',
  url: 'https://leetcode.com/problems/find-the-longest-substring-containing-vowels-in-even-counts/',
  complexity: 'O(n) time and O(1) extra space: at most 32 parity masks are stored. The visualization accepts up to 200 letters.',
  examples: [
    { label: 'Double a', input: '{"s":"aa"}' },
    { label: 'Mixed', input: '{"s":"xaabyy"}' },
    { label: 'Vowels', input: '{"s":"aeiou"}' },
    { label: "Single consonant", input: "{\"s\":\"b\"}" },
    { label: "Repeated vowel", input: "{\"s\":\"aa\"}" },
    { label: "Longest input, all a", input: "{\"s\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}" },
    { label: "Long run: 200 letters", input: "{\"s\":\"tqokcthryiwpxvbnrdtkaehozzrhtmysbtuszdtlmtuwbyjqrzvzbbxhrlxzfvolmtpfruvajlzauutcsuxskavoyiqhqfrrhkvhwxrwchoahsnidtbflrbbranlfspklqffecqkkvazgymjabetnbqlvqjcqfgcpohwegzadeeltrbtccxkypsktxlazocvdjlalueg\"}" },
  ],
}

export default function LongestEvenVowelSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [from, to] = step.snapshot.bestRange || [0, 0]
    return <>
      <IndexedSequence label="Text" length={run.input.s.length} valueAt={i => run.input.s[i]}
        active={step.snapshot.prefix - 1}
        roleAt={i => {
          const [matchFrom, matchTo] = step.snapshot.window || []
          if (matchFrom !== undefined) {
            if (i === matchFrom) return 'l'
            if (i === matchTo - 1) return 'r'
            if (i > matchFrom && i < matchTo - 1) return 'window'
          }
          return step.snapshot.bestRange && i >= from && i < to ? 'window' : ''
        }} />
      <section aria-label="Parity mask">
        <h3>Parity mask</h3>
        <p><strong>{step.snapshot.maskText}</strong></p>
        <p>Prefix length {step.snapshot.prefix}. Distinct masks recorded: {step.snapshot.seen}.</p>
        <p>{step.snapshot.bestRange ? `Longest so far: s[${from}..${to - 1}], length ${step.snapshot.best}.` : 'No even-count substring found yet.'}</p>
      </section>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two prefixes with the same parity mask differ by a substring where every vowel count is even. Keeping the earliest prefix for each mask gives the longest such gap.</p>
  </>} />
}
