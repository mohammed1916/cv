import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

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
    { label: 'Example A', input: '{"s":"ab1z9"}' },
    { label: 'Example B', input: '{"s":"4m7n"}' },
    { label: 'Example C', input: '{"s":"byby"}' },
  ],
}

export default function MirrorFrequencyDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Pair counts">
      <h3>Pair counts</h3>
      <div className="algorithm-sequence__cells">{step.pair ? step.pair.map(ch => (
        <div key={ch} className="algorithm-sequence__cell is-active" data-role="window">
          <small>char</small><strong>{ch}</strong><span>freq {step.freq[ch] || 0}</span>
        </div>)) : Object.entries(step.freq).map(([ch, n]) => (
        <div key={ch} className="algorithm-sequence__cell" data-role="">
          <small>char</small><strong>{ch}</strong><span>freq {n}</span>
        </div>))}</div>
    </section>
    <output aria-label="Running total">{`Total ${step.total}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Every letter has a mirror in the alphabet and every digit has a mirror in 0 to 9. Each pair is counted once even though both members point at each other.</p>
    <p>The contribution of a pair is the gap between how often its two members appear.</p>
  </>} />
}
