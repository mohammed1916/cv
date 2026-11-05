import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last positions', description: 'Note where each digit appears last.' },
    { id: 'scan', label: 'Scan left to right', description: 'Find the first digit with a larger digit after it.' },
    { id: 'swap', label: 'Swap once', description: 'Swap that digit with the largest later digit’s last occurrence.' },
    { id: 'done', label: 'Result', description: 'The number after at most one swap.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Number (JSON integer)',
  url: 'https://leetcode.com/problems/maximum-swap/',
  complexity: 'O(n) time for n digits, with O(1) extra space for the ten last-position slots.',
  examples: [
    { label: 'Far swap', input: '1993' },
    { label: 'Already max', input: '9876' },
    { label: 'Repeated digits', input: '5518' },
  ],
}

export default function MaximumSwap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits" length={step.digits.length} active={step.i ?? -1} valueAt={i => step.digits[i]}
      roleAt={i => (i === step.i && i === step.j ? 'l = r' : i === step.i ? 'l' : i === step.j ? 'r' : '')} />
    <output aria-label="Current number">{step.phase === 'done' ? `Result ${step.result}` : `Digits ${step.digits.join('')}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the last occurrence:</strong> moving the largest digit as far left as possible helps most, and the rightmost copy leaves the earlier digits unchanged.</p>
  </>} />
}
