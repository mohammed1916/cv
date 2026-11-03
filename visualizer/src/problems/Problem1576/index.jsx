import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1576',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of letters and ? marks (JSON string)',
  url: 'https://leetcode.com/problems/replace-all-s-to-avoid-consecutive-repeating-characters/',
  complexity: 'O(n) time: one left-to-right pass, and each ? checks at most two neighbours.',
  examples: [
    { label: 'Mixed', input: '"a?b??c"' },
    { label: 'All marks', input: '"???"' },
    { label: 'Between letters', input: '"ab?c?d"' },
  ],
}

const tile = (active, replaced) => ({
  minWidth: 40, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace',
  background: replaced ? '#bbf7d0' : 'transparent', color: replaced ? '#1c1917' : 'inherit',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})

export default function AvoidConsecutiveRepeats() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, chars } = step.snapshot
    const original = run.input
    return <>
      <div role="img" aria-label="String positions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chars.map((ch, k) => <div key={k} style={tile(k === index, original[k] === '?' && ch !== '?')}>{ch}<small> {k}</small></div>)}
      </div>
      <p>Green cells were ? marks that are now filled. The outlined cell is the position being handled.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Greedy from the left:</strong> the left neighbour is already final, so each ? only has to differ from it and from its right neighbour as it stands.</p>
    <p><strong>Why three letters are enough:</strong> two neighbours block at most two letters, so one of a, b, c always remains.</p>
  </>} />
}
