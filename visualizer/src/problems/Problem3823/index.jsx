import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort positions', description: 'Separate the letter positions from the special character positions.' },
    { id: 'letters', label: 'Reverse letters', description: 'Reverse the letters within the letter positions.' },
    { id: 'specials', label: 'Reverse specials', description: 'Reverse the special characters within their own positions.' },
    { id: 'done', label: 'Complete', description: 'Return the rebuilt string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/reverse-letters-then-special-characters-in-a-string/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 30 characters.',
  examples: [
    { label: 'Mixed', input: '{"s":"ab-cd"}' },
    { label: 'Two specials', input: '{"s":"a!b@c"}' },
  ],
}

export default function ReverseLettersThenSpecialCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="String" length={step.chars.length} valueAt={i => step.chars[i]} active={-1}
      roleAt={i => (step.moved.includes(i) ? 'moved' : '')} />
    <output aria-label="Current string">{`Current: ${step.chars.join('')}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Letters and special characters never trade places, so each kind is reversed only among its own positions.</p>
  </>} />
}
