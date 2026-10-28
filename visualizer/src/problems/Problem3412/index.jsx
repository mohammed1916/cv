import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Walk the string from left to right.' },
    { id: 'match', label: 'Pair', description: 'Pair with the closest unmarked mirror letter and score the distance.' },
    { id: 'keep', label: 'Remember', description: 'No mirror letter is waiting, so remember this one.' },
    { id: 'done', label: 'Complete', description: 'Report the mirror score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s: 1 to 12 lowercase letters',
  url: 'https://leetcode.com/problems/find-mirror-score-of-a-string/',
  complexity: 'O(n) time for a string of length n. The visualization caps s at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aczzx"}' },
    { label: 'No pairs', input: '{"s":"abcdef"}' },
  ],
}

export default function MirrorScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters of s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.index} roleAt={index => (step.matched?.[index] ? 'marked' : '')} />
    <output aria-label="Score">{`Mirror score so far: ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>A letter's mirror is its reflection in the alphabet, so a and z pair, b and y pair, and so on.</p>
    <p>Pairing with the closest earlier unmarked mirror keeps each distance as small as possible, and the stack of unmarked positions gives that closest one directly.</p>
  </>} />
}
