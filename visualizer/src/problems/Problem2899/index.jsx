import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty record', description: 'No integer has been read yet.' },
    { id: 'number', label: 'Record', description: 'An integer joins the record and resets the streak.' },
    { id: 'prev', label: 'Look back', description: 'A prev steps back through the record.' },
    { id: 'missing', label: 'Too far', description: 'The record is too short, so the answer is -1.' },
    { id: 'done', label: 'Result', description: 'Every prev has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON list of words, each "prev" or an integer from 1 to 100 as a string',
  url: 'https://leetcode.com/problems/last-visited-integers/',
  complexity: 'O(n * n) time in the worst case for a run of prev words, O(n) space. The visualization caps the list at 20 words.',
  examples: [
    { label: 'Growing record', input: '["5","8","prev","9","prev","prev","prev"]' },
    { label: 'Too far back', input: '["4","prev","prev","7","prev"]' },
    { label: "Single prev with no history", input: "[\"prev\"]" },
    { label: "Repeated number then prev", input: "[\"5\",\"5\",\"prev\",\"prev\"]" },
    { label: "Maximum length, alternating", input: "[\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\",\"100\",\"prev\"]" },
    { label: "Long run: 20 words", input: "[\"prev\",\"prev\",\"98\",\"24\",\"57\",\"prev\",\"prev\",\"prev\",\"prev\",\"21\",\"73\",\"38\",\"43\",\"19\",\"14\",\"prev\",\"prev\",\"37\",\"prev\",\"81\"]" },
  ],
}

export default function LastVisitedIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.at >= 0 ? step.at : 0}
      roleAt={i => (i === step.at ? 'window' : '')} />
    <output aria-label="Answers so far">{`streak ${step.streak}, answers [${step.answers.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Integers are kept in order. A prev means the one before the last visited integer: a run of k prevs reads the k-th integer from the end.</p>
    <p>If fewer than k integers have been recorded, the answer is -1.</p>
  </>} />
}
