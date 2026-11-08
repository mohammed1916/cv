import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No query answered yet.' },
    { id: 'query', label: 'Query', description: 'Look at the substring for this query.' },
    { id: 'trade', label: 'Trade', description: 'Try a block of ones between zeros.' },
    { id: 'result', label: 'Record', description: 'Store the count after the best trade.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (binary string, up to 16 characters) and queries ([l, r] pairs, up to 4)',
  url: 'https://leetcode.com/problems/maximize-active-section-with-trade-ii/description/',
  complexity: 'Teaching simulation: each query checks every block of ones, so O(n^2) per query. The official constraints need a far faster method.',
  examples: [
    { label: 'Invented example', input: '{"s":"1010001","queries":[[0,6],[1,3]]}' },
    { label: 'All ones', input: '{"s":"1111","queries":[[0,3]]}' },
    { label: 'Single bit query', input: '{"s":"1","queries":[[0,0]]}' },
    { label: 'Equal bits in ranges', input: '{"s":"0000","queries":[[0,3],[1,2]]}' },
    { label: 'Largest string and ends', input: '{"s":"1010101010101010","queries":[[0,15],[0,0],[15,15]]}' },
    { label: 'Zero string query', input: '{"s":"00","queries":[[0,1]]}' },
    { label: 'Long run: 16 bits, 4 queries', input: '{"s":"0110101001000110","queries":[[0,15],[3,9],[7,7],[2,14]]}' },
  ],
}

export default function MaximizeActiveSectionWithTradeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]}
      active={step.block ? step.block[0] : step.window ? step.window[0] : -1}
      roleAt={i => {
        if (step.block && i >= step.block[0] && i <= step.block[1]) return 'block'
        if (step.window && i >= step.window[0] && i <= step.window[1]) return 'window'
        return ''
      }} />
    <output aria-label="Query answers">{`answers so far: ${step.answers.length ? step.answers.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A trade converts one block of ones that has zeros on both sides into zeros, and then fills the longest zero run with ones.</p>
    <p>The augmented ones at both ends stop blocks at the boundary from counting as surrounded, and they never add to the count.</p>
    <p>This teaching model is knowledge-derived and not verified against the official judge.</p>
  </>} />
}
