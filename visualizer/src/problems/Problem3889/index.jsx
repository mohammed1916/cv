import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, mirror } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each character once.' },
    { id: 'pair', label: 'Pairs', description: 'Visit each mirror pair once.' },
    { id: 'done', label: 'Result', description: 'Report the total gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a string of lowercase letters and digits',
  url: 'https://leetcode.com/problems/mirror-frequency-distance/',
  complexity: 'O(n) to count plus a constant number of mirror pairs. The visual caps s at 60 characters.',
  examples: [
    { label: 'Example A', input: '{"s":"aaz9"}' },
    { label: 'Example B', input: '{"s":"0912"}' },
    { label: 'Example C', input: '{"s":"qqqtt"}' },
    { label: 'Single digit', input: '{"s":"7"}' },
    { label: 'Equal characters', input: '{"s":"zzzz"}' },
    { label: 'Sixty characters', input: '{"s":"a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9"}' },
    { label: 'Long run: 60 characters', input: '{"s":"5aiufy5yjs5khrsr8p54d3ckt1oyr0k28uvwarsze5og4mr0oklbhtha4rv6"}' },
  ],
}

// Mirror pairs as rows: each pair shows its two frequencies and the gap; the pair being visited is highlighted.
function PairRows({ freq, pairs, current }) {
  return <table aria-label="Mirror pairs">
    <thead><tr><th scope="col">pair</th><th scope="col">freq c</th><th scope="col">freq m</th><th scope="col">gap</th></tr></thead>
    <tbody>{pairs.map(([c, m]) => {
      const fc = freq[c] || 0, fm = freq[m] || 0
      const isCurrent = current && current[0] === c && current[1] === m
      return <tr key={`${c}${m}`} data-current={isCurrent ? 'yes' : undefined} data-role={fc + fm === 0 ? 'muted' : ''}>
        <th scope="row">{c} – {m}</th><td>{fc}</td><td>{fm}</td><td>{Math.abs(fc - fm)}</td></tr>
    })}</tbody>
  </table>
}

export default function MirrorFrequencyDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const chars = [...new Set([...run.input.s, ...[...run.input.s].map(mirror)])]
    const seen = new Set()
    const pairs = []
    for (const c of chars.sort()) {
      const m = mirror(c)
      const key = [c, m].sort().join('')
      if (seen.has(key)) continue
      seen.add(key)
      pairs.push([c, m])
    }
    return <>
      <PairRows freq={step.freq} pairs={pairs} current={step.pair} />
      <output aria-label="Running total">{`Total ${step.total}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every letter has a mirror in the alphabet and every digit has a mirror in 0 to 9. Each pair is counted once even though both members point at each other.</p>
    <p>The contribution of a pair is the gap between how often its two members appear.</p>
  </>} />
}
