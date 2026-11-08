import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
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
    { label: 'Own case 1', input: '{"s":"ifffmmppp","words":["ifmmp","ij","ifmp"]}' },
    { label: 'Own case 2', input: '{"s":"aaaaazzzzz","words":["aazz","az","azz"]}' },
    { label: 'Length 2 cannot stretch', input: '{"s":"aaaabbcc","words":["abbc","aabcc","aaaabbc","aabbcc"]}' },
    { label: 'Single letter', input: '{"s":"a","words":["a"]}' },
    { label: 'Duplicate words are each checked', input: '{"s":"aabbcc","words":["abc","abc"]}' },
    { label: 'Longest allowed string (30 letters)', input: '{"s":"aaaabbbbccccddddeeeeffffgggghh","words":["abbbcc","aaaabbbbccc","gghh"]}' },
    { label: 'Long run: 8 words, 30 letters', input: '{"s":"aaadddaaaaaadaddddbcccdddbbbbf","words":["bcaaa","cbcab","a","bbbc","cab","cb","ccbbc","caabca"]}' },
  ],
}
export default function ExpressiveWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const S = runsOf(run.input.s)
    return <>
      <IndexedSequence label="Target runs" length={S.length} active={step.run} valueAt={i => `${S[i][0]}x${S[i][1]}`} />
      {step.word >= 0 && <IndexedSequence label={`Word "${run.input.words[step.word]}" runs`} length={step.wordRuns.length} active={step.run} valueAt={i => `${step.wordRuns[i][0]}x${step.wordRuns[i][1]}`} />}
      {step.word >= 0 && step.wordRuns.length > 0 && <RecordStateTable label="Run pairs compared (target run stretches the word run)" columns={['pair', 'target', 'word', 'verdict']} activeRow={step.run}
        rows={S.slice(0, Math.min(S.length, step.wordRuns.length)).map(([a, x], i) => {
          const [b, y] = step.wordRuns[i]
          const verdict = a !== b ? 'letters differ' : x < y ? 'too short' : x === y ? 'equal' : x < 3 ? 'needs 3 or more' : 'stretched'
          return { pair: i, target: `${a} x${x}`, word: `${b} x${y}`, verdict }
        })} />}
      <IndexedSequence label="Stretchy result per word" length={run.input.words.length} active={step.word} valueAt={i => run.input.words[i]} roleAt={i => step.results[i] === null ? '' : step.results[i] ? 'yes' : 'no'} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Rule:</strong> a run in the target must either equal the word's run, or be longer and have length at least 3, because only groups of size three or more can be produced by extension.</p>
  </>} />
}
