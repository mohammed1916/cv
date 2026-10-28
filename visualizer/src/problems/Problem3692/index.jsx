import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty count for every letter.' },
    { id: 'count', label: 'Count', description: 'Tally each letter in the string.' },
    { id: 'group', label: 'Groups', description: 'Compare the frequency groups by distinct letters, then by frequency.' },
    { id: 'done', label: 'Complete', description: 'Report the letters of the majority group.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of 1 to 40 lowercase letters, for example "pfpfgi"',
  url: 'https://leetcode.com/problems/majority-frequency-characters/',
  complexity: 'O(n + d log d) time for n letters and d distinct frequencies. The visualization caps the string at 40 letters.',
  examples: [
    { label: 'Example 1', input: '"aaabbbccdddde"' },
    { label: 'Example 2', input: '"abcd"' },
    { label: 'Example 3', input: '"pfpfgi"' },
  ],
}

export default function MajorityFrequencyCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.length} valueAt={index => run.input[index]}
      active={step.letter === null ? -1 : run.input.indexOf(step.letter)} />
    <output aria-label="Majority group">{step.result === null ? `Best frequency so far: ${step.best ?? 'none'}` : `Majority group: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Each letter's frequency is its count. Letters with the same frequency form a group, and the group size is the number of distinct letters in it.</p>
    <p>The majority group has the most letters. On a tie, the larger frequency wins.</p>
  </>} />
}
