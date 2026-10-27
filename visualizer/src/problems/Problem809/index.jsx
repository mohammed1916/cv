import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, runsOf, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Run-length encode the target string.' },
    { id: 'word', label: 'Encode word', description: 'Run-length encode the current word.' },
    { id: 'compare', label: 'Compare runs', description: 'Check one pair of runs.' },
    { id: 'accept', label: 'Stretchy', description: 'Every run pair is compatible.' },
    { id: 'reject', label: 'Not stretchy', description: 'A mismatch rules the word out.' },
    { id: 'done', label: 'Complete', description: 'Return the stretchy count.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {s, words} (JSON)',
  url: 'https://leetcode.com/problems/expressive-words/',
  complexity: 'O(total length of s and all words) time and space for the encodings.',
  examples: [
    { label: 'Example 1', input: '{"s":"heeellooo","words":["hello","hi","helo"]}' },
    { label: 'Example 2', input: '{"s":"zzzzzyyyyy","words":["zzyy","zy","zyy"]}' },
    { label: 'Length 2 cannot stretch', input: '{"s":"aaaabbcc","words":["abbc","aabcc","aaaabbc","aabbcc"]}' },
  ],
}
export default function ExpressiveWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const S = runsOf(run.input.s)
    return <>
      <IndexedSequence label="Target runs" length={S.length} active={step.run} valueAt={i => `${S[i][0]}x${S[i][1]}`} />
      {step.word >= 0 && <IndexedSequence label={`Word "${run.input.words[step.word]}" runs`} length={step.wordRuns.length} active={step.run} valueAt={i => `${step.wordRuns[i][0]}x${step.wordRuns[i][1]}`} />}
      <IndexedSequence label="Stretchy result per word" length={run.input.words.length} active={step.word} valueAt={i => run.input.words[i]} roleAt={i => step.results[i] === null ? '' : step.results[i] ? 'yes' : 'no'} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Rule:</strong> a run in the target must either equal the word's run, or be longer and have length at least 3, because only groups of size three or more can be produced by extension.</p>
  </>} />
}
