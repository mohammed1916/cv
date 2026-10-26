import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Start at the left bound.' },
    { id: 'keep', label: 'Self-dividing', description: 'Every digit is nonzero and divides the number.' },
    { id: 'skip', label: 'Rejected', description: 'Some digit is zero or fails to divide.' },
    { id: 'done', label: 'Complete', description: 'Return the qualifying numbers.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Range (JSON object with left and right)',
  url: 'https://leetcode.com/problems/self-dividing-numbers/',
  complexity: 'O((right − left + 1) · d) time for numbers with d digits.',
  examples: [
    { label: 'Ten to twenty-two', input: '{"left":1,"right":22}' },
    { label: 'Ten to fifteen', input: '{"left":47,"right":85}' },
  ],
}

export default function SelfDividingNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Found">Found so far: [{step.found.join(', ')}]</output>
    <p>Checking {step.n}{step.ok === undefined ? '' : step.ok ? ' — kept' : ' — rejected'}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Zero rule:</strong> a zero digit disqualifies the number, because no integer is divisible by zero.</p>
  </>} />
}
