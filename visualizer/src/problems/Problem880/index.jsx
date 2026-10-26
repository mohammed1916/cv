import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with size 0.' },
    { id: 'length', label: 'Grow length', description: 'Scan forward tracking the decoded length.' },
    { id: 'unwind', label: 'Unwind', description: 'Walk backwards, reducing k modulo size.' },
    { id: 'done', label: 'Complete', description: 'Return the k-th decoded character.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Input ["encoded", k] (JSON)',
  url: 'https://leetcode.com/problems/decoded-string-at-index/',
  complexity: 'O(|s|) time and O(1) space; the decoded string, possibly astronomically long, is never built.',
  examples: [
    { label: 'leet2code3', input: '["leet2code3", 10]' },
    { label: 'ha22', input: '["ha22", 5]' },
    { label: 'a2345678999999999999999', input: '["a2345678999999999999999", 1]' },
  ],
}

export default function DecodedStringAtIndex() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const chars = [...run.input.s]
      return <>
        <IndexedSequence label="Encoded string" length={chars.length} valueAt={i => chars[i]} active={step.index}
          roleAt={i => (step.index >= 0 && i > step.index ? 'unseen' : '')} />
        <output aria-label="Decoded size and k">size = {step.size}, k = {step.k}</output>
        {step.phase === 'done' && <output aria-label="Result">Answer: {run.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Key idea:</strong> if the decoded text so far has length size and is repeated, position k is the same as position k mod size. Walking backwards undoes each repeat or letter until k lands exactly on a letter.</p>
    </>} />
}
