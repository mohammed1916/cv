import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'Begin with the original string.' },
    { id: 'pair', label: 'Pair', description: 'Find the close pair to merge.' },
    { id: 'merge', label: 'Merge', description: 'Delete the right character.' },
    { id: 'done', label: 'Result', description: 'Return the string with no close pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k',
  url: 'https://leetcode.com/problems/merge-close-characters/',
  complexity: 'Each merge shortens the string, and each search scans the pairs again. The visual caps the string at 16 letters.',
  examples: [
    { label: 'Example', input: '{"s":"mnmpnm","k":2}' },
    { label: 'Run of a', input: '{"s":"aaa","k":1}' },
  ],
}

export default function MergeCloseCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div className="algorithm-sequence" aria-label="Current string">
      <h3>Current string</h3>
      <div className="algorithm-sequence__cells">{[...step.cur].map((ch, index) =>
        <div key={index} className="algorithm-sequence__cell" data-role={step.pair && step.pair.includes(index) ? 'window' : ''}>
          <small>[{index}]</small><strong>{ch}</strong><span>{step.pair && step.pair.includes(index) ? (index === step.pair[0] ? 'left' : 'merges left') : ' '}</span></div>)}</div>
    </div>
    <output aria-label="Merge status">{step.pair ? `Pair ${step.pair[0]} and ${step.pair[1]} is close` : step.cur}</output>
  </>} renderReasoning={() => <>
    <p>Two equal letters merge when their indices are at most k apart. The right one is removed, and the indices after it shift left.</p>
    <p>Each search takes the smallest left index first, then the smallest right index, so the order of merges is fixed.</p>
  </>} />
}
