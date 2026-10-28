import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No word counts yet.' },
    { id: 'message', label: 'Add message', description: 'Add this message’s words to its sender.' },
    { id: 'done', label: 'Complete', description: 'Pick the sender with the largest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: { "messages": [...], "senders": [...] }',
  url: 'https://leetcode.com/problems/sender-with-largest-word-count/',
  complexity: 'O(total characters) time and O(senders) space.',
  examples: [
    { label: 'Example 1', input: '{"messages":["Hello userTwooo","Hi userThree","Wonderful day Alice","Nice day userThree"],"senders":["Alice","userTwo","userThree","Alice"]}' },
    { label: 'Example 2', input: '{"messages":["How is leetcode for everyone","Leetcode is useful for practice"],"senders":["Bob","Charlie"]}' },
  ],
}

export default function SenderWithLargestWordCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Senders" length={run.input.senders.length} valueAt={i => run.input.senders[i]} active={step.index} roleAt={i => (i < step.index ? 'counted' : '')} />
    <output aria-label="Word totals">{`Totals: ${Object.entries(step.totals).map(([name, n]) => `${name} ${n}`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each sender&apos;s total is the sum of the word counts of their messages, so messages are only added, never compared.</p>
    <p>When two totals tie, the problem asks for the name that sorts last, so the comparison breaks ties by name.</p>
  </>} />
}
