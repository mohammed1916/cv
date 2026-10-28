import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the password.' },
    { id: 'length', label: 'Length', description: 'At least 8 characters.' },
    { id: 'lower', label: 'Lowercase', description: 'Need one lowercase letter.' },
    { id: 'upper', label: 'Uppercase', description: 'Need one uppercase letter.' },
    { id: 'digit', label: 'Digit', description: 'Need one digit.' },
    { id: 'special', label: 'Special', description: 'Need one special character.' },
    { id: 'adjacent', label: 'Adjacent', description: 'No two neighbours may be equal.' },
    { id: 'done', label: 'Complete', description: 'Report strong or weak.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "password" (string), JSON',
  url: 'https://leetcode.com/problems/strong-password-checker-ii/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps passwords at 30 characters.',
  examples: [
    { label: 'Strong', input: '{"password":"IloveLe3tcode!"}' },
    { label: 'Adjacent repeat', input: '{"password":"Me+You--IsMyDream"}' },
    { label: 'Too short', input: '{"password":"1aB!"}' },
  ],
}

export default function StrongPasswordCheckerII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Password characters' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Each rule is independent, and the first rule that fails decides the answer, so the checks can stop early.</p>
    <p>The adjacent-repeat rule is the only one that compares neighbouring characters rather than scanning for a class.</p>
  </>} />
}
