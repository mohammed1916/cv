import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No letter has been seen yet.' },
    { id: 'scan', label: 'Remember', description: 'Add a new letter to the seen set.' },
    { id: 'match', label: 'Repeat', description: 'This letter is already in the set; return it.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letters as JSON: {"s": "..."}',
  url: 'https://leetcode.com/problems/first-letter-to-appear-twice/',
  complexity: 'O(n) time and O(1) extra space for the 26-letter set. The visualization caps input at 50 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abccbaacz"}' },
    { label: 'Example 2', input: '{"s":"abcdd"}' },
  ],
}

export default function FirstRepeatedLetter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i < step.index && run.input.s.indexOf(run.input.s[i]) !== i ? 'repeat' : '')} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Answer">{step.result ? `Answer: ${step.result}` : 'Answer not found yet'}</output>
  </>} renderReasoning={() => <>
    <p>Scanning left to right, the first letter that is already in the seen set is the one whose second copy comes earliest in the string.</p>
    <p>The set answers “seen before?” in one step, so no letter is compared with every other letter.</p>
  </>} />
}
