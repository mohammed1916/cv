import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Type the first letter with a free finger.' },
    { id: 'visit', label: 'Choose finger', description: 'Compare moving the finger that typed the previous letter with moving the other finger.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the cost already computed for this letter and other-finger position.' },
    { id: 'store', label: 'Store', description: 'Save the cheaper choice for this state.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word (1 to 30 capital letters)',
  url: 'https://leetcode.com/problems/minimum-distance-to-type-a-word-using-two-fingers/',
  complexity: 'O(n * 26) states, each with two choices. The visualization caps the word at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"CAKE"}' },
    { label: 'Example 2', input: '{"word":"HAPPY"}' },
  ],
}

export default function TwoFingerTyping() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { word } = run.input
    return <>
      <IndexedSequence label="Word" length={word.length} valueAt={i => word[i]} active={step.index ?? -1}
        roleAt={i => (step.index !== null && i < step.index ? 'typed' : '')} />
      <output aria-label="Other finger">{`Other finger rests on: ${step.other < 0 ? 'nothing yet' : String.fromCharCode(65 + step.other)}`}</output>
      <table aria-label="Memo table">
        <thead><tr><th>Letter</th><th>Other finger</th><th>Cost from here</th></tr></thead>
        <tbody>{step.memo.map(e => <tr key={`${e.index}:${e.other}`}><td>{e.index}</td><td>{e.other < 0 ? 'none' : String.fromCharCode(65 + e.other)}</td><td>{e.value}</td></tr>)}</tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each letter is typed by one of the two fingers. The cost of the next letter depends only on which letter the other finger is resting on.</p>
    <p>A finger that has not been used yet costs nothing to move, so the first two letters are free.</p>
  </>} />
}
