import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Classify', description: 'An @ sign means email, otherwise phone.' },
    { id: 'email', label: 'Lowercase email', description: 'Email addresses are case-insensitive.' },
    { id: 'phone', label: 'Extract digits', description: 'Strip separators from the phone number.' },
    { id: 'mask', label: 'Mask', description: 'Hide the sensitive characters.' },
    { id: 'country', label: 'Country code', description: 'Extra leading digits become a starred prefix.' },
    { id: 'done', label: 'Complete', description: 'Return the masked string.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Email or phone (JSON string)',
  url: 'https://leetcode.com/problems/masking-personal-information/',
  complexity: 'O(n) time and space for a string of n characters.',
  examples: [
    { label: 'Email', input: '"LeetCode@LeetCode.com"' },
    { label: 'Phone, 10 digits', input: '"1(234)567-890"' },
    { label: 'Phone, country code', input: '"86-(10)12345678"' },
  ],
}
export default function MaskingPersonalInformation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => run.input[i] === '@' ? 'at sign' : ''} />
    {step.partial && <IndexedSequence label="Working string" length={step.partial.length} valueAt={i => step.partial[i]} roleAt={i => step.partial[i] === '*' ? 'hidden' : ''} />}
    <output aria-label="Masked output">{step.phase === 'done' ? `Result: ${run.result}` : 'Result pending'}</output>
  </>} renderReasoning={({ run }) => <>
    <p>Emails keep only the first and last letter of the name, always followed by five stars, so the name length is not leaked.</p>
    <p>Phones keep the last four digits. Digits beyond ten are the country code, shown as stars after a plus sign.</p>
    <p>{run.input.includes('@') ? 'This input is an email.' : 'This input is a phone number.'}</p>
  </>} />
}
