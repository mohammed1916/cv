import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Words and letters (JSON object)',
  url: 'https://leetcode.com/problems/stream-of-characters/',
  complexity: 'Building costs O(total word length). Each query walks at most the longest stored word.',
  examples: [
    { label: 'Suffix match', input: '{"words":["ab","cd","bcd"],"letters":"xabcd"}' },
    { label: 'Repeats', input: '{"words":["a","aa"],"letters":"baa"}' },
  ],
}

function StreamChecker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <p>Stream so far: <strong>{s.history || '(empty)'}</strong></p>
      <p>Walk from the newest letter backwards: <strong>{s.walk || '—'}</strong>{s.hit === true ? ' · word found' : ''}</p>
      <table>
        <caption>Stored words, each reversed</caption>
        <thead><tr><th>Stored reversed form</th></tr></thead>
        <tbody>{s.stored.map(w => <tr key={w}><td>{w}</td></tr>)}</tbody>
      </table>
      <p>Answers: {s.answers.length ? s.answers.map(a => a ? 'true' : 'false').join(', ') : 'none yet'}</p>
    </>
  }} renderReasoning={() => <>
    <p>Reversing each word turns "ends with this word" into "starts from the newest letter". One trie walk per query therefore checks every word at once.</p>
    <p>The walk stops at the first missing edge, or at the first point where a stored word ends.</p>
  </>} />
}

export default withProblemStory(StreamChecker, storyGuide);
