import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the characters of the string.' },
    { id: 'swap', label: 'Swap', description: 'Swap the two characters at the ends of the prefix.' },
    { id: 'done', label: 'Complete', description: 'Report the string with its prefix reversed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String and prefix length (JSON object with s and k)',
  url: 'https://leetcode.com/problems/reverse-string-prefix/',
  complexity: 'O(k) time and O(n) space.',
  examples: [
    { label: 'Seven letters, k three', input: '{"s":"lattice","k":3}' },
    { label: 'Own: banana, k 2', input: '{"s":"banana","k":2}' },
    { label: "Single letter", input: "{\"s\":\"a\",\"k\":1}" },
    { label: "Equal letters", input: "{\"s\":\"aaaa\",\"k\":2}" },
    { label: "Full length k at 30", input: "{\"s\":\"abcdefghijklmnopqrstuvwxyzabcd\",\"k\":30}" },
    { label: "Long run: 30 letters", input: "{\"s\":\"cxbqxgvwirdsognpgjojacfzzpaseb\",\"k\":15}" },
  ],
}

export default function ReverseStringPrefix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Characters" length={step.chars.length} valueAt={i => step.chars[i]} active={step.left}
      roleAt={i => (i < run.input.k ? 'prefix' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Swapping from both ends of the prefix reverses it in place, and the rest of the string never moves.</p>
  </>} />
}
